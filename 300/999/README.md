# 999 - Presentations

We make use of these two technologies:

1) WebSlides
2) NodePPT (which uses WebSlides)

## 100 - Getting Started with NodePPT

Install NodePPT globally as follows:

```
$ npm install -g nodeppt
```

## 200 - Create a new Slide

Create a new slide with an official template:

```
$ cd presentations
$ nodeppt new slide.md
```

You will be prompted as follows:

```
? Input your presentation topic: 
```

For now type ```My Presentation Topic``` followed by Enter.

```
? Input your name: 
```

For now type ```Me, the Presenter``` followed by Enter.

🐝  slide.md create success!

──────────────────── 🎉  Success! ────────────────────

To get started: nodeppt serve slide.md

A file called ```slide.md``` has ben created in the directory "presentations" at the root of the repository.

Alternatively, create a new slide straight from a github template:

```
$ nodeppt new slide.md -t vanHeemstraSystems/presentation-management
```

You will be prompted:

```
? slide.md file exists. Continue?: (Use arrow keys)
> overwrite
```

If a slide my the same name was created previously, this is your chance to overwrite it. Or run above command again with a different slide name.

Next, you will be prompted:

```
...
```

Start local server to show the slide (here: ```slide.md```):

```
$ cd presentations
$ nodeppt serve slide.md
```

To build a slide (here: ```slide.md```), run:

```
$ cd presentations
$ nodeppt build slide.md
```

