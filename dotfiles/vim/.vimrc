""
"" Janus setup
""

" Define paths
let s:janus_vim_path = expand("~/.vim/janus/vim")
let g:janus_path = escape(s:janus_vim_path, ' ')
let g:janus_vim_path = escape(s:janus_vim_path, ' ')
let g:janus_custom_path = expand("~/.janus")

let s:janus_core_file = s:janus_vim_path . "/core/before/plugin/janus.vim"
let s:janus_plugins_file = s:janus_vim_path . "/core/plugins.vim"

for s:janus_required_file in [s:janus_core_file, s:janus_plugins_file]
  if !filereadable(s:janus_required_file)
    echohl ErrorMsg
    echom "Janus runtime file is missing: " . s:janus_required_file
    echom "Restore Janus at ~/.vim/janus/vim before launching Vim."
    echohl None
    finish
  endif
endfor

" Source janus's core
exe 'source ' . fnameescape(s:janus_core_file)

" You should note that groups will be processed by Pathogen in reverse
" order they were added.
call janus#add_group("tools")
call janus#add_group("langs")
call janus#add_group("colors")

""
"" Customisations
""

if filereadable(expand("~/.vimrc.before"))
  source ~/.vimrc.before
endif


" Disable plugins prior to loading pathogen
exe 'source ' . fnameescape(s:janus_plugins_file)

""
"" Pathogen setup
""

" Load all groups, custom dir, and janus core
call janus#load_pathogen()

" .vimrc.after is loaded after the plugins have loaded
