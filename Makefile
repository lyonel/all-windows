all: all-windows@ezix.org.zip

all-windows@ezix.org.zip: COPYING README.md extension.js favicon.png favicon.svg metadata.json
	zip $@ $^
