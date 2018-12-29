RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
CYAN_BACKGROUND='\033[46m'
NC='\033[0m'
ITALIC='\e[3'
UNDERLINE='\e[4m'

title() {
    echo -e " "
    figlet $1
    echo -e " "
}

info_text() {
    echo -e "${YELLOW}$1${NC}"
}

warning_text() {
    echo -e "${YELLOW}$1${NC}"
}

error_text() {
    echo -e "${RED}$1${NC}"
}

success_text() {
    echo -e "${GREEN}$1${NC}"
}

red_title() {
    title $1 'RED'
}

green_title() {
    title $1 'GREEN'
}

yellow_title() {
    title $1 'YELLOW'
}

blue_title() {
    title $1 'BLUE'
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
