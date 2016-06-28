all: node_modules-stamp

latest.zip:
	wget -N https://downloads.raspberrypi.org/raspbian_lite_latest -O latest.zip

latest.img: latest.zip
	unzip latest.zip '*.img'
	mv *.img latest.img
	touch $@

kpartx-stamp: latest.img
	sudo kpartx -a -v latest.img
	touch $@

mount-stamp: kpartx-stamp
	mkdir -p target
	sudo mount /dev/mapper/loop0p2 target
	touch $@

target/home/pi/scan: mount-stamp
	mkdir -p target/home/pi/scan
	cp -a config package.json scan.js target/home/pi/scan/

target/tmp/node_latest_armhf.deb: target/home/pi/scan
	wget -N http://node-arm.herokuapp.com/node_latest_armhf.deb -O $@
	touch $@

target/usr/local/bin/node: target/tmp/node_latest_armhf.deb
	sudo proot -q qemu-arm -S target dpkg -i target/tmp/node_latest_armhf.deb
	sudo touch $@

node_modules-stamp: target/usr/local/bin/node target/home/pi/scan
	sudo proot -q qemu-arm -S target -w target/home/pi/scan  npm install
	touch $@

umount: 
	sudo umount target

clean: umount
	sudo kpartx -d latest.img
	rm latest.zip
	rm latest.img
	rm *-stamp
