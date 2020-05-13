# SNIK Technical Blog 
Blog, dashboard and quality check for the SNIK project.

## Local Development
See [Testing your GitHub Pages site locally with Jekyll](https://help.github.com/en/github/working-with-github-pages/testing-your-github-pages-site-locally-with-jekyll).

0. Install git, Ruby, RubyGems and Bundler
1. `git clone git@github.com:IMISE/snik-ontology.git --branch gh-pages snik-pages` 
2. `bundle install`
3. `bundle exec jekyll serve --incremental` (or execute `./run`)

## Deployment 
Just `git push` and GitHub Pages will automatically deploy it at <https://imise.github.io/snik-ontology/> after a short while.
