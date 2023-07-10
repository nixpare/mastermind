package mastermind

import (
	"net/http"

	"github.com/nixpare/process"
	"github.com/nixpare/server/v2"
)

const (
	repoPath = "C:/Program Files/PareServer/nixpare/mastermind"
	passkey = "vivalapapaya"
)

var (
	MasterMind = server.Website {
		Name: "Mastermind",
		Dir: repoPath + "/public",
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
		case "/manage-git":
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

	if r.Passkey != passkey {
		route.Error(http.StatusBadRequest, "Authentication failed")
		return
	}

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
		route.Error(http.StatusBadRequest, "Command not found")
	}
}

func gitCommand(args ...string) ([]byte, error) {
	p, err := process.NewProcess(repoPath, "git", args...)
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
