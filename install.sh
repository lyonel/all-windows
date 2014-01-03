#!/bin/sh

BASEDIR=.local/share/gnome-shell/extensions
DIR=all-windows@ezix.org
URL=https://github.com/lyonel/all-windows.git

which git 2> /dev/null > /dev/null || ( echo Could not find Git ; exit 1 )

cd $HOME
mkdir -p ${BASEDIR} 2> /dev/null

cd ${BASEDIR} || ( echo Could not change to ${BASEDIR} ; exit 2 )

echo Using ${HOME}/${BASEDIR}/${DIR}

if [ -d ${DIR}/.git ]; then
	echo Already installed, updating...
	cd ${DIR}
	git pull
else
	if [ -d ${DIR} ]; then
		echo Found a previous installation.
		echo If you are sure you want to replace it, please delete this folder and retry.
		exit 4
	else
		git clone ${URL} ${DIR} || exit 3
	fi
fi
