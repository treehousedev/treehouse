VERSION := 18.12.0

bundle:
	npm install @octokit/rest@$(VERSION) && esbuild octokit.js --bundle --outfile=../../static/vnd/octokit-$(VERSION).min.js --format=esm --minify