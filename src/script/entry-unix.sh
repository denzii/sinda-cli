
#!/bin/bash
# source this file from consuming script

# installs apt-get packages the machine
# in: string[] package names of the requested packages 
# out: string[] package names which were not installed on the machine
# fails on: if the out array length is greater than zero
install() {
    INSTALLATION_FAILED_PACKAGES=()
    confirm "$@ require(s) installation, would you like to install now?"
    if [[ $? -eq 0 ]]; then
        for PACKAGE in "$@"; do
            if [[ $(apt-cache search "$PACKAGE" 2>/dev/null | grep -c "$PACKAGE" -) -ne "" ]]; then
                if [[ $? -eq 0 ]]; then
                    sudo apt-get install "$PACKAGE"
                    if [[ $? -eq 0 ]]; then
                        echo "$PACKAGE installed successfully"
                    else
                        INSTALLATION_FAILED_PACKAGES+=("$PACKAGE")
                        echo "sudo apt-get for the package: $PACKAGE failed"
                    fi
                else
                    if $PACKAGE -eq "nvm"; then                        
                        install_nvm
                    fi
                fi
            fi
        done
	# if test out length is greater than 0, then return 1
	if [[ ${#INSTALLATION_FAILED_PACKAGES[@]} -gt 0 ]]; then
	INSTALL_ERR=$INSTALLATION_FAILED_PACKAGES
		return 1;
	else
		return 0;
	fi
    else
        return 1;
    fi
}

# checks if packages exists on the machine or not
# in: string[] package names of the required packages 
# out: string[] package names which were not found on the machine
# fails on: if the out array length is greater than zero
_test() {
    _TEST_OUT=();
    for PACKAGE in "$@"; do
        if ! command -v "$PACKAGE" >/dev/null 2>&1; then
            if [[ "$PACKAGE" == "nvm" ]]; then
                NVM_DIR_OUT=$(echo $NVM_DIR)
                if [ "$NVM_DIR_OUT" = "" ];
                then
                    _TEST_OUT+=("$PACKAGE") 
                fi
            else
                _TEST_OUT+=("$PACKAGE") 
            fi
        fi
    done
    # if test out lenght is greater than 0, then return 1
    if [[ ${#_TEST_OUT[@]} -gt 0 ]]; then
	_TEST_ERR=$_TEST_OUT
        return 1;
    else
        return 0;
    fi
}

# formats array input into human readable format: 
# array(hello,world) => " 'hello', 'world' "
# in: string[] items to be formatted
# out: string formatted output string
_format() {
    ITERATION=0
    _FORMAT_OUT=""
    for i in $@; do
        if [ $ITERATION -eq 0 ]; then
            _FORMAT_OUT+="'$i'"
            ITEMS_LENGTH=${#_TEST_FAILED_PACKAGES[@]}
        elif [ $ITERATION -eq $ITEMS_LENGTH ]; then
            _FORMAT_OUT+=" and '$i':"
        else
            _FORMAT_OUT+=", '$i'"
        fi
        ITERATION=+1
    done
}

ensure_nodejs_ver() {
    ENSURE_NODEJS_VER_OUT=()
    for VERSION in $@; do
        # redirect nvm ls error and out to /dev/null
        import_nvm
        NVM_LS_OUT="`nvm ls $VERSION`"; #>/dev/null 2>&1`";
        if [[ $? -ne 0 ]]; then
            ENSURE_NODEJS_VER_OUT+=("$VERSION")
        fi
    done
    if [[ ${#ENSURE_NODEJS_VER_OUT[@]} -gt 0 ]]; then
        _format $ENSURE_NODEJS_VER_OUT
        ENSURE_NODEJS_VER_HUMAN_OUT=$_FORMAT_OUT
    else
        ENSURE_NODEJS_VER_HUMAN_OUT="All required nodejs versions are already installed"
    fi

    if [ ${#ENSURE_NODEJS_VER_OUT[@]} -ne 0 ]; then
	ENSURE_NODEJS_VER_ERR=$ENSURE_NODEJS_VER_OUT
	ENSURE_NODEJS_VER_OUT=""
        return 1
    else
        return 0;
    fi
}

import_nvm(){
        export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    return 0
}

install_nvm(){
    echo "installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
    source ~/.bashrc
    import_nvm
		return 0
}

walk_node_vers () {
    # get versions as array
    jq -r 'engines.node' 
    # for VERSION in "$@"; do
    #     if ! nvm ls "$VERSION" >/dev/null 2>&1; then
    #         nvm install "$VERSION"
    #     fi
    # done
		return 0
}

nvm_install_node() {
    for VERSION in "$@"; do
        if ! nvm ls "$VERSION" >/dev/null 2>&1; then
            nvm install "$VERSION"
        fi
    done
}

confirm() {
    echo "$1"
    read -p "Please confirm (y/n)" USER_CONSENT
    
    if [[ $USER_CONSENT =~ ^[Yy]$ ]]; then
        return 0;
    else
        return 1;
    fi
}


ensure() {
    LIB_REQUIRED_PACKAGES=("jq" "curl" "nvm" "git")
    ENSURE_OUT=""
		
    _test "$@" "${LIB_REQUIRED_PACKAGES[@]}"

    # if test out length is not zero, call format function
    if [[ ${#_TEST_OUT[@]} -gt 0 ]]; then
        _format "${_TEST_OUT[@]}"
        ENSURE_HUMAN_OUT=$_FORMAT_OUT
    else
        ENSURE_HUMAN_OUT="All required packages are already installed"
    fi  
    
    ENSURE_OUT=$TEST_OUT

    if [ ${#_TEST_OUT[@]} -ne 0 ]; then
        return 1
    else
        return 0;
    fi
}

ensurePackages() {
    ensure "$@"
    if [[ $? -ne 0 ]]; then
        confirm "$ENSURE_HUMAN_OUT require(s) installation, would you like to install now?"
        if [[ $? -eq 0 ]]; then
            sudo apt-get update && sudo apt-get upgrade && install "${ENSURE_OUT[@]}";
        else
            _format ${REQUIRED_PACKAGES[@]}
            FORMATTED_REQUIRED_PACKAGES=$_FORMAT_OUT
            echo "Installation of ${FORMATTED_REQUIRED_PACKAGES[@]} is/are required for the util to work..."
            exit 1
        fi
    fi
    if [[ $? -ne 0 ]]; then
        _format ${REQUIRED_PACKAGES[@]}
        FORMATTED_REQUIRED_PACKAGES=$_FORMAT_OUT
        _format ${LIB_REQUIRED_PACKAGES[@]}
        FORMATTED_REQUIRED_PACKAGES+=$FORMAT_OUT

        echo "Installation of $FORMATTED_REQUIRED_PACKAGES... Required for the util to work :("
        exit 1
    fi
}

ensureNodeJS() {
    ensure_nodejs_ver "$@"
    if [[ $? -ne 0 ]]; then
        confirm "The following nodejs versions are not installed: $ENSURE_NODEJS_VER_HUMAN_OUT. would you like to install now?"
        if [[ $? -eq 0 ]]; then
            nvm_install_node "${ENSURE_NODEJS_VER_OUT[@]}";
        else 
            echo "Those are required for the utilities to run, install them manually or come back when you change your mind..."
            exit 1
        fi
    fi 
    if [[ $? -ne 0 ]]; then
            echo  "Something went wrong while installing node versions, cannot continue :("
            exit 1;
    fi
}
