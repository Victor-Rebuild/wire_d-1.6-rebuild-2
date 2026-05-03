package mods

import (
	"fmt"
	"net/http"
	"os"

	"github.com/os-vector/wired/vars"
)

type BackpackLights struct {
	vars.Modification
}

func NewBackpackLights() *BackpackLights {
	return &BackpackLights{}
}

func (modu *BackpackLights) Name() string {
	return "BackpackLights"
}

func (modu *BackpackLights) Description() string {
	return "Swaps between Anki's backpack lights and CFW backpack lights."
}

func (modu *BackpackLights) Load() error {
	return nil
}

func (m *BackpackLights) HTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/api/mods/BackpackLights/isAnkiLights" {
		if _, err := os.Stat("/data/data/enableankilights"); err == nil {
			fmt.Fprintf(w, "true")
		} else {
			fmt.Fprintf(w, "false")
		}
		return
	} else if r.URL.Path == "/api/mods/BackpackLights/setAnki" {
		os.WriteFile("/data/data/enableankilights", []byte("true"), 0777)
		vars.HTTPSuccess(w, r)
		return
	} else if r.URL.Path == "/api/mods/BackpackLights/setCustom" {
		os.Remove("/data/data/enableankilights")
		vars.HTTPSuccess(w, r)
		return
	} else {
		vars.HTTPError(w, r, "404 not found")
		return
	}
}
