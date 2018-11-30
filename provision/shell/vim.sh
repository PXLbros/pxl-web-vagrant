#!/bin/bash

. /vagrant/provision/helpers.sh

title "vim.sh"

export EDITOR="vim";

if ! grep -qF "export EDITOR" $HOME/.bashrc
then
    echo -e "\nexport EDITOR=$EDITOR" >> $HOME/.bashrc
fi

# Save .vimrc
echo "set history=500
filetype plugin on
filetype indent on
set autoread
set ruler
set cmdheight=2
set hid
set backspace=eol,start,indent
set whichwrap+=<,>,h,l
set ignorecase
set smartcase
set hlsearch
set incsearch
set lazyredraw
set showmatch
set mat=2
set noerrorbells
set novisualbell
set t_vb=
set tm=500

syntax enable

try
    colorscheme desert
catch
endtry

set background=dark
set encoding=utf8
set ffs=unix,dos,mac
set nobackup
set nowb
set noswapfile
set expandtab
set smarttab
set shiftwidth=4
set tabstop=4
set ai
set si
set laststatus=2

set statusline=Dir:\ %r%{getcwd()}%h
set statusline+=\ \ \~\ \ 
set statusline+=File:\ %f
set statusline+=\ \ \~\ \
set statusline+=Line:\ %l\ (%p%%)

:set mouse=a" > $HOME/.vimrc
