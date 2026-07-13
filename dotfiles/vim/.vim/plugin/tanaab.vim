if exists('g:loaded_tanaab_profile')
  finish
endif
let g:loaded_tanaab_profile = 1

command! TanaabWelcome call tanaab#ui#welcome(1)

augroup tanaab_profile
  autocmd!
  autocmd VimEnter * call tanaab#ui#welcome(0)
  autocmd FileType c,cpp,css,dockerfile,go,html,java,javascript,javascriptreact,json,jsonc,lua,python,ruby,rust,scss,sh,toml,typescript,typescriptreact,vim,vue,yaml,zsh let b:tanaab_trim_trailing_whitespace = 1
  autocmd BufWritePre * if get(b:, 'tanaab_trim_trailing_whitespace', 0) | call tanaab#ui#trim_trailing_whitespace() | endif
  autocmd FileType make setlocal noexpandtab
  autocmd FileType gitcommit setlocal textwidth=72 colorcolumn=73
augroup END
