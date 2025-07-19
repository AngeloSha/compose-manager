package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/imdario/mergo"
	"gopkg.in/yaml.v3"
)

var index = map[string]string{}

// scan looks for Docker Compose files recursively
func scan(dirs []string) {
	index = map[string]string{}

	skip := map[string]bool{
		"/proc": true, "/sys": true, "/dev": true,
		"/run": true, "/snap": true, "/tmp": true,
	}

	for _, root := range dirs {
		if skip[root] {
			continue
		}

		log.Printf("Scanning %s...", root)
		_ = filepath.WalkDir(root, func(p string, d os.DirEntry, err error) error {
			if err != nil || d.IsDir() {
				return nil
			}
			name := strings.ToLower(d.Name())
			if name == "docker-compose.yml" ||
				name == "docker-compose.yaml" ||
				strings.HasSuffix(name, ".compose.yml") ||
				strings.Contains(name, "docker-compose.") && strings.HasSuffix(name, ".yml") {
				if b, err := os.ReadFile(p); err == nil {
					index[p] = string(b)
				}
			}
			return nil
		})
	}
}

func mergeFiles(paths []string) (string, error) {
	var merged map[string]interface{}
	collisions := map[string]int{}

	for _, p := range paths {
		raw, ok := index[p]
		if !ok {
			continue
		}
		var doc map[string]interface{}
		if err := yaml.Unmarshal([]byte(raw), &doc); err != nil {
			return "", fmt.Errorf("%s: %w", p, err)
		}

		if merged == nil {
			merged = doc
			continue
		}

		// merge non-service blocks
		for k, v := range doc {
			if k == "services" {
				continue
			}
			if base, ok := merged[k].(map[string]interface{}); ok {
				_ = mergo.Merge(&base, v, mergo.WithOverride)
				merged[k] = base
			} else {
				merged[k] = v
			}
		}

		// handle services
		srcSvcs, _ := doc["services"].(map[string]interface{})
		if merged["services"] == nil {
			merged["services"] = map[string]interface{}{}
		}
		dstSvcs := merged["services"].(map[string]interface{})

		for name, val := range srcSvcs {
			if _, exists := dstSvcs[name]; !exists {
				dstSvcs[name] = val
			} else {
				collisions[name]++
				dstSvcs[fmt.Sprintf("%s_%d", name, collisions[name]+1)] = val
			}
		}
	}

	if merged == nil {
		return "", fmt.Errorf("nothing to merge")
	}

	// move version to top
	if v, ok := merged["version"]; ok {
		delete(merged, "version")
		ordered := map[string]interface{}{"version": v}
		for k, val := range merged {
			ordered[k] = val
		}
		merged = ordered
	}

	out, err := yaml.Marshal(merged)
	return string(out), err
}

func main() {
	port := getenv("PORT", "8686")
	roots := strings.Split(getenv("SCAN_DIRS", "/"), ",")
	scan(roots)

	r := gin.Default()

	r.Static("/assets", "/opt/web/assets")
	r.GET("/", sendIndex)
	r.NoRoute(sendIndex)

	r.GET("/files", listFiles)
	r.GET("/file", getFile)
	r.PUT("/file", putFile)
	r.GET("/merge", apiMerge)

	r.POST("/lint", func(c *gin.Context) {
		body, _ := io.ReadAll(c.Request.Body)
		var v any
		if err := yaml.Unmarshal(body, &v); err != nil {
			c.String(http.StatusBadRequest, err.Error())
		} else {
			c.String(http.StatusOK, "ok")
		}
	})

	log.Printf("Compose‑Manager listening on :%s", port)
	log.Fatal(r.Run(":" + port))
}

func sendIndex(c *gin.Context) {
	c.File("/opt/web/index.html")
}

func listFiles(c *gin.Context) {
	keys := make([]string, 0, len(index))
	for k := range index {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	out := make(map[string]string, len(keys))
	for _, k := range keys {
		out[k] = index[k]
	}
	c.JSON(http.StatusOK, out)
}

func getFile(c *gin.Context) {
	p := c.Query("path")
	if v, ok := index[p]; ok {
		c.String(http.StatusOK, v)
	} else {
		c.String(http.StatusNotFound, "not found")
	}
}

func putFile(c *gin.Context) {
	p := c.Query("path")
	body, _ := io.ReadAll(c.Request.Body)
	if err := os.WriteFile(p, body, 0644); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	index[p] = string(body)
	c.String(http.StatusOK, "saved")
}

func apiMerge(c *gin.Context) {
	raw := c.Query("paths")
	if raw == "" {
		c.String(http.StatusBadRequest, "paths query missing")
		return
	}
	yml, err := mergeFiles(strings.Split(raw, ","))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.String(http.StatusOK, yml)
}

func getenv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

