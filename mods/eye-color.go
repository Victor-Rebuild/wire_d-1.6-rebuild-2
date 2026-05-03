package mods

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/Victor-Rebuild/wire_d-1.6-rebuild-2/vars"
)

var consoleClient = &http.Client{
	Transport: &http.Transport{
		DisableKeepAlives: true,
	},
}

type EyeColor struct {
	vars.Modification
}

func NewEyeColor() *EyeColor {
	return &EyeColor{}
}

func (m *EyeColor) Name() string {
	return "EyeColor"
}

func (m *EyeColor) Description() string {
	return "Set Vector's custom eye color using a hue/saturation color wheel."
}

func (m *EyeColor) Load() error {
	return nil
}

func (m *EyeColor) HTTP(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.URL.Path, "/api/mods/"+m.Name()+"/") {
		return
	}
	switch strings.TrimPrefix(r.URL.Path, "/api/mods/"+m.Name()+"/") {
	case "get":
		col, err := getEyeColor()
		if err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
		out, err := json.Marshal(col)
		if err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(out)
		return

	case "set":
		hueStr := r.FormValue("hue")
		satStr := r.FormValue("saturation")
		hue, err := strconv.ParseFloat(hueStr, 64)
		if err != nil || hue < 0 || hue > 1 {
			vars.HTTPError(w, r, "hue must be a float between 0 and 1")
			return
		}
		sat, err := strconv.ParseFloat(satStr, 64)
		if err != nil || sat < 0 || sat > 1 {
			vars.HTTPError(w, r, "saturation must be a float between 0 and 1")
			return
		}
		if err := applyCustomEyeColor(hue, sat); err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
		vars.HTTPSuccess(w, r)
		return

	case "disable":
		if err := disableCustomEyeColor(); err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
		vars.HTTPSuccess(w, r)
		return

	default:
		vars.HTTPError(w, r, "404 not found")
		return
	}
}

func isEOF(err error) bool {
	return errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF)
}

func consoleVarSet(key, value string) error {
	resp, err := consoleClient.PostForm("http://localhost:8888/consolevarset", url.Values{
		"key":   {key},
		"value": {value},
	})
	if err != nil {
		if isEOF(err) {
			return nil
		}
		return fmt.Errorf("consolevarset %s: %w", key, err)
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()
	return nil
}

func consoleFuncCall(funcName string) error {
	rawBody := "func=" + url.QueryEscape(funcName) + "&args="
	req, err := http.NewRequest("POST", "http://localhost:8888/consolefunccall", strings.NewReader(rawBody))
	if err != nil {
		return fmt.Errorf("consolefunccall build request %s: %w", funcName, err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := consoleClient.Do(req)
	if err != nil {
		if isEOF(err) {
			return nil
		}
		return fmt.Errorf("consolefunccall %s: %w", funcName, err)
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()
	return nil
}

func applyCustomEyeColor(hue, saturation float64) error {
	hueStr := fmt.Sprintf("%.5f", hue)
	satStr := fmt.Sprintf("%.5f", saturation)

	if err := consoleVarSet("CustomEyeColorHue", hueStr); err != nil {
		return err
	}
	if err := consoleVarSet("CustomEyeColorSaturation", satStr); err != nil {
		return err
	}
	if err := consoleVarSet("CustomEyeColorEnabled", "true"); err != nil {
		return err
	}
	time.Sleep(550 * time.Millisecond)
	return consoleFuncCall("DebugSetCustomEyeColor")
}

func disableCustomEyeColor() error {
	if err := consoleVarSet("CustomEyeColorEnabled", "false"); err != nil {
		return err
	}
	return consoleFuncCall("DebugSetCustomEyeColor")
}
