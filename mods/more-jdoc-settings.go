package mods

import (
	"bytes"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"encoding/json"

	"github.com/Victor-Rebuild/wire_d-1.6-rebuild-2/vars"
	"github.com/digital-dream-labs/vector-go-sdk/pkg/vectorpb"
)

type MoreJdocSettings struct {
	vars.Modification
}

func NewMoreJdocSettings() *MoreJdocSettings {
	return &MoreJdocSettings{}
}

func (modu *MoreJdocSettings) Name() string {
	return "MoreJdocSettings"
}

func (modu *MoreJdocSettings) Description() string {
	return "More Jdoc Settings"
}

func (modu *MoreJdocSettings) Load() error {
	return nil
}

type eyeColorResponse struct {
	IsCustom         bool    `json:"iscustom"`
	Preset           int     `json:"preset"`
	CustomHue        float32 `json:"hue"`
	CustomSaturation float32 `json:"saturation"`
}

func (m *MoreJdocSettings) HTTP(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.URL.Path, "/api/mods/"+m.Name()) {
		return
	}
	switch strings.TrimPrefix(r.URL.Path, "/api/mods/"+m.Name()+"/") {
	case "getEyeColor":
		color, err := getEyeColor()
		if err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
		colorBytes, _ := json.Marshal(color)
		w.Write(colorBytes)
		return
	case "setEyeColor":
		color := r.FormValue("color")
		err := setEyeColor(color)
		if err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
	case "setCustomEyeColor":
		hue := r.FormValue("hue")
		sat := r.FormValue("sat")
		err := setCustomEyeColor(hue, sat)
		if err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
	case "getVolume":
		volume, err := getVolume()
		if err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
		w.Write([]byte(fmt.Sprint(volume)))
		return
	case "setVolume":
		volume := r.FormValue("volume")
		err := setVolume(volume)
		if err != nil {
			vars.HTTPError(w, r, err.Error())
			return
		}
	// this could be where names go
	default:
		vars.HTTPError(w, r, "404 not found")
		return
	}
	vars.HTTPSuccess(w, r)
}

func setEyeColor(color string) error {
	colorInt, err := strconv.Atoi(color)
	if err != nil {
		return errors.New("given color is not an int")
	}
	if colorInt < 0 || colorInt > 9 {
		return errors.New("given color is not between 0 and 9")
	}
	return setSettingsSDKjson(`{"custom_eye_color": {"enabled": false}, "eye_color": ` + fmt.Sprint(colorInt) + `}`)
}

func setCustomEyeColor(hue string, sat string) error {
	hueFloat, err := strconv.ParseFloat(hue, 64)
	if err != nil {
		return errors.New("given hue is not a float")
	}
	satFloat, err := strconv.ParseFloat(sat, 64)
	if err != nil {
		return errors.New("given saturation is not a float")
	}
	if hueFloat < 0 || hueFloat > 1 || satFloat < 0 || satFloat > 1 {
		return errors.New("given hue and saturation must be between 0 and 1")
	}
	return setSettingSDKintbool("custom_eye_color", fmt.Sprintf(`{"enabled": true, "hue": %.3f, "saturation": %.3f}`, hueFloat, satFloat))
}

func setVolume(volume string) error {
	volumeInt, err := strconv.Atoi(volume)
	if err != nil {
		return errors.New("given volume is not an int")
	}
	if volumeInt < 0 || volumeInt > 5 {
		return errors.New("given volume is not between 0 and 5")
	}
	return setSettingSDKintbool("master_volume", fmt.Sprint(volumeInt))
}

func setSettingsSDKjson(settings string) error {
	url := "https://localhost:443/v1/update_settings"
	var updateJSON = []byte(`{"update_settings": true, "settings": ` + settings + ` }`)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(updateJSON))
	guid, err := vars.GetGUID()
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+guid)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Transport: transCfg}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

func getEyeColor() (eyeColorResponse, error) {
	var resp eyeColorResponse
	doc, err := getJdoc()
	if err != nil {
		return eyeColorResponse{}, err
	}
	resp.Preset = doc.EyeColor
	if doc.CustomEyeColor.Enabled {
		resp.IsCustom = true
		resp.CustomHue = float32(doc.CustomEyeColor.Hue)
		resp.CustomSaturation = float32(doc.CustomEyeColor.Saturation)
	}
	return resp, nil
}

func getVolume() (int, error) {
	doc, err := getJdoc()
	if err != nil {
		return 0, err
	}
	return doc.MasterVolume, nil
}

func getJdoc() (robotSettingsJson, error) {
	v, err := vars.GetVec()
	if err != nil {
		return robotSettingsJson{}, err
	}
	r, err := v.Conn.PullJdocs(ctx,
		&vectorpb.PullJdocsRequest{
			JdocTypes: []vectorpb.JdocType{
				vectorpb.JdocType_ROBOT_SETTINGS,
			},
		},
	)
	if err != nil {
		return robotSettingsJson{}, err
	}
	doc := r.NamedJdocs[0].Doc.JsonDoc
	var decodedDoc robotSettingsJson
	json.Unmarshal([]byte(doc), &decodedDoc)
	return decodedDoc, nil
}
