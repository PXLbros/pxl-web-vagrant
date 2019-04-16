RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'

ITALIC='\e[3'
UNDERLINE='\e[4m'

NC='\033[0m'

title() {
    echo -e " "
    figlet -t $1
    echo -e " "
}

red_text() {
    echo -e "${RED}$1${NC}"
}

green_text() {
    echo -e "${GREEN}$1${NC}"
}

yellow_text() {
    echo -e "${YELLOW}$1${NC}"
}

blue_text() {
    echo -e "${BLUE}$1${NC}"
}

purple_text() {
    echo -e "${PURPLE}$1${NC}"
}

cyan_text() {
    echo -e "${CYAN}$1${NC}"
}

highlight_text() {
    yellow_text "$1"
}

info_text() {
    cyan_text "$1"
}

warning_text() {
    yellow_text "$1"
}

error_text() {
    red_text "$1"
}

success_text() {
    green_text "$1"
}

line_break() {
    echo -e " "
}
