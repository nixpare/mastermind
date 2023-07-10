package mastermind

import (
	"fmt"
	"net/http"
	"unicode"

	"github.com/nixpare/logger"
	"github.com/nixpare/process"
	"github.com/nixpare/server/v2"
)

var (
	MasterMind = server.Website {
		Name: "Mastermind",
		Dir: basedir + "/public",
		MainPages: []string{ "/" },
		NoLogPages: []string{ "/assets/" },
		AllFolders: []string{ "" },
	}
)

type request struct {
	Passkey string `json:"passkey"`
	Cmd     string `json:"cmd"`
	Args    string `json:"args"`
}

func MasterMindRoute(route *server.Route) {
	switch route.Method {
	case "GET", "HEAD":
		route.StaticServe(true)
	case "POST":
		switch route.RequestURI {
		case manage_git_addr:
			manageGit(route)
		default:
			route.Error(http.StatusMethodNotAllowed, "Method not allowed")
		}
	default:
		route.Error(http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func manageGit(route *server.Route) {
	r, err := server.ReadJSON[request](route)
	if err != nil {
		route.Error(http.StatusBadRequest, "Invalid request", err)
		return
	}

	user, ok := passkeys[r.Passkey]
	if !ok {
		route.Error(http.StatusBadRequest, "Authentication failed")
		return
	}

	var logArgs string
	if r.Args != "" {
		logArgs = " " + r.Args
	}
	route.Logger.Printf(logger.LOG_LEVEL_INFO, "Mastermind git management: %s sent <%s%s> command", user, r.Cmd, logArgs)

	r.Cmd = removeWhiteSpace(r.Cmd)
	r.Args = removeWhiteSpace(r.Args)

	switch r.Cmd {
	case "status":
		resp, err := gitCommand("status")
		if err != nil {
			route.Error(http.StatusBadRequest, "Error: " + string(resp), r.Cmd, r.Args)
			return
		}

		route.ServeData(resp)
	case "checkout":
		resp, err := gitCommand("checkout", r.Args)
		if err != nil {
			route.Error(http.StatusBadRequest, "Error: " + string(resp), r.Cmd, r.Args)
			return
		}

		route.ServeData(resp)
	case "pull":
		resp, err := gitCommand("pull")
		if err != nil {
			route.Error(http.StatusBadRequest, "Error: " + string(resp), r.Cmd, r.Args)
			return
		}

		route.ServeData(resp)
	default:
		route.Error(http.StatusBadRequest, fmt.Sprintf("Command not found: <%s>", r.Cmd))
	}
}

func gitCommand(args ...string) ([]byte, error) {
	p, err := process.NewProcess(basedir, "git", args...)
	if err != nil {
		return nil, err
	}

	err = p.Start(process.DevNull(), process.DevNull(), process.DevNull())
	if err != nil {
		return nil, err
	}

	exitStatus := p.Wait()
	if err = exitStatus.Error(); err != nil {
		return p.Stderr(), err
	}

	return p.Stdout(), nil
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
