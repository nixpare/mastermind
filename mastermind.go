package mastermind

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"pareserver/util"
	"strconv"
	"unicode"

	"github.com/nixpare/logger/v3"
	"github.com/nixpare/nix"
	"github.com/nixpare/process"
)

type request struct {
	Passkey string `json:"passkey"`
	Cmd     string `json:"cmd"`
	Args    string `json:"args"`
}

var colors = []string{"red", "orange", "yellow", "green", "lightblue", "blue", "violet", "black"}

func Mastermind() http.Handler {
	mux, n, _ := util.WebsiteHandler("mastermind.nixpare.com", basedir + "/public")

	mux.Handle("GET /app.webmanifest", n.Handle(func(ctx *nix.Context) {
		ctx.MimeType("application/manifest+json")
		ctx.ServeCached("/app.webmanifest")
	}))

	mux.Handle("GET /secret/{n}", n.Handle(func(ctx *nix.Context) {
		ctx.DisableErrorCapture()
		ctx.DisableLogging()

		n, err := strconv.Atoi(ctx.R().PathValue("n"))
		if err != nil {
			ctx.Error(http.StatusBadRequest, "Invalid request", err)
			return
		}

		if n < 0 || n >= len(colors) {
			ctx.Error(http.StatusBadRequest, "Invalid request", "Color number out of range")
			return
		}

		var secret []string
		colorsCopy := make([]string, len(colors))
		copy(colorsCopy, colors)

		for i := 0; i < n; i++ {
			idx := rand.Intn(len(colorsCopy))
			secret = append(secret, colorsCopy[idx])
			colorsCopy = append(colorsCopy[:idx], colorsCopy[idx+1:]...)
		}

		type payload struct {
			Colors []string `json:"colors"`
			Secret []string `json:"secret"`
		}

		data, err := json.Marshal(payload{
			Colors: colors,
			Secret: secret,
		})
		if err != nil {
			ctx.Error(http.StatusInternalServerError, "Internal server error", err)
			return
		}

		ctx.JSON(data)
	}))

	mux.Handle("POST " + manage_git_addr, n.Handle(manageGit))

	return mux
}

func manageGit(ctx *nix.Context) {
	var r request
	err := ctx.ReadJSON(&r)
	if err != nil {
		ctx.Error(http.StatusBadRequest, "Invalid request", err)
		return
	}

	user, ok := passkeys[r.Passkey]
	if !ok {
		ctx.Error(http.StatusBadRequest, "Authentication failed")
		return
	}

	var logArgs string
	if r.Args != "" {
		logArgs = " " + r.Args
	}
	ctx.Logger().Clone(nil, true, "msm-git").Printf(logger.LOG_LEVEL_INFO, "Mastermind git management: %s sent <%s%s> command", user, r.Cmd, logArgs)

	r.Cmd = removeWhiteSpace(r.Cmd)
	r.Args = removeWhiteSpace(r.Args)

	switch r.Cmd {
	case "status":
		resp, err := gitCommand("status")
		if err != nil {
			ctx.Error(http.StatusBadRequest, "Error: " + string(resp), r.Cmd, r.Args, err)
			return
		}

		ctx.Write(resp)
	case "checkout":
		resp, err := gitCommand("checkout", r.Args)
		if err != nil {
			ctx.Error(http.StatusBadRequest, "Error: " + string(resp), r.Cmd, r.Args, err)
			return
		}

		ctx.Write(resp)
	case "pull":
		resp, err := gitCommand("pull")
		if err != nil {
			ctx.Error(http.StatusBadRequest, "Error: " + string(resp), r.Cmd, r.Args, err)
			return
		}

		ctx.Write(resp)
	default:
		ctx.Error(http.StatusBadRequest, fmt.Sprintf("Command not found: <%s>", r.Cmd))
	}
}

func gitCommand(args ...string) ([]byte, error) {
	p, err := process.NewProcess(basedir, "git", args...)
	if err != nil {
		return nil, err
	}

	outB := bytes.NewBuffer(nil)
	errB := bytes.NewBuffer(nil)

	_, err = p.Run(nil, outB, errB)
	if err != nil {
		return errB.Bytes(), err
	}

	return outB.Bytes(), nil
}

func removeWhiteSpace(s string) string {
	var res string
	for _, c := range s {
		if !unicode.IsSpace(c) {
			res += string(c)
		}
	}
	return res
}
