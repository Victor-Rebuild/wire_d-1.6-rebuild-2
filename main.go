package main

import (
	"fmt"
	"net/http"

	"github.com/Victor-Rebuild/wire_d-1.6-rebuild-2/mods"
	"github.com/Victor-Rebuild/wire_d-1.6-rebuild-2/vars"
)

var EnabledMods []vars.Modification = []vars.Modification{
	mods.NewFreqChange(),
	mods.NewWakeWordPV(),
	mods.NewAutoUpdate(),
	mods.NewSensitivityPV(),
	mods.NewJdocSettings(),
	mods.NewFaces(),
	mods.NewEyeColor(),
}

func main() {
	vars.EnabledMods = EnabledMods
	vars.InitMods()
	startweb()
}

func startweb() {
	fmt.Println("starting web at port 8080")
	fs := http.FileServer(http.Dir("/etc/wired/webroot"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// no mno non o caching
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")

		fs.ServeHTTP(w, r)
	})
	http.ListenAndServe(":8080", nil)
}
