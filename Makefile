.PHONY: wired

all: wired

go_deps:
	echo `${HOME}/.anki/go/dist/1.24.4/go/bin/go version` && ${HOME}/.anki/go/dist/1.24.4/go/bin/go mod download

libvector-gobot:
	cd vector-gobot && make GCC=${HOME}/.anki/vicos-sdk/dist/6.0.0-r08/prebuilt/bin/arm-oe-linux-gnueabi-clang GPP=${HOME}/.anki/vicos-sdk/dist/6.0.0-r08/prebuilt/bin/arm-oe-linux-gnueabi-clang++
	cp vector-gobot/build/libvector-gobot.so build/

wired: go_deps
	CGO_ENABLED=0 GOARM=7 GOARCH=arm \
	CXX=${HOME}/.anki/vicos-sdk/dist/6.0.0-r08/prebuilt/bin/arm-oe-linux-gnueabi-clang++ \
	 ${HOME}/.anki/go/dist/1.24.4/go/bin/go build -tags vicos -ldflags '-w -s' -o build/wired main.go
#	${HOME}/.anki/upx/dist/5.0.1/upx --best --lzma build/wired


#vic-gateway: go_deps
#	CGO_ENABLED=1 GOARM=7 GOARCH=arm CC=/home/build/.anki/vicos-sdk/dist/4.0.0-r05/prebuilt/bin/arm-oe-linux-gnueabi-clang CXX=/home/build/.anki/vicos-sdk/dist/4.0.0-r05/prebuilt/bin/arm-oe-linux-gnueabi-clang++ PKG_CONFIG_PATH="$(pwd)/armlibs/lib/pkgconfig" CGO_CFLAGS="-I$(pwd)/armlibs/include -I$(pwd)/armlibs/include/opus -I$(pwd)/armlibs/include/ogg" CGO_CXXFLAGS="-stdlib=libc++ -std=c++11" CGO_LDFLAGS="-L$(pwd)/armlibs/lib -L$(pwd)/armlibs/lib/arm-linux-gnueabi/android" /usr/local/go/bin/go build -tags nolibopusfile,vicos -ldflags '-w -s -linkmode internal -extldflags "-static" -r /anki/lib' -o build/vic-gateway gateway/*.go
#
#	upx build/vic-gateway

