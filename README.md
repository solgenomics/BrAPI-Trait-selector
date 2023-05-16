# BrAPI Trait Selector

## Description
The BrAPI Trait Selector application provides a user interface to filter
germplasm according to their trait. The user interface is composed by an SVG
image representing a plant of interest and a javascript application that manages
user actions. The user can click on a part of the SVG reprensenting a given
observable trait (usualy corresponding to anatomical part of a plant and named
"entity" in the BrAPI terminology). This action displays a list of available
trait that can be observed at the given clicked part and the corresponding
values that are found in the database (through BrAPI calls). When the user
selects a trait value, the list of matching germplasm is displayed.

## Installation
To install the application, the Javascript file needs to be compiled and
deployed. A configuration file and an SVG file need to be created as well.
A BrAPI endpoint that provides the appropriate data is also required.
TODO: better document the installation process.

## Configuration
TODO: describe the configuration file (format, settings).

## SVG creation documentation
### Structure
The SVG image of a plant anatomy anatomical parts should be grouped together and
should not contain elements with a "transformation" attribute. It is possible
and recommended to use sub-groups to group groups of sub-elements together in
larger groups (ie.: elements of a pistil can be grouped in a "pistil" group
while the "pistil" group can be part of the larger "flower" group). Each
anatomical part (or group of anatomical parts) should have a "name" attribute
that corresponds to the value used for the BrAPI field "entity" of "Trait"
elements. It is possible to use the same name on different elements (ie. the
"leaf" name can be used on every leaf element for instance as well as on a text
element displaying "Leaves"). When using text, it is recommended to add a
rectangle or an ellipsis behind the text that can be either visible or
transparent (ie. using the CSS class "brapi-transparent") to capture mouse or
touch events as it might be difficult to click on a thin letter. Such rectangles
or ellipsis should be grouped with the text they correspond to.

### Zoomable elements
Some anatomical parts may not be visible on a global plant schema. For instance,
the details of a pistil can not be seen at the scale of a tree, or the internal
parts of a fruit can only be seen in a slice. To enable the user to see such
elements, it is possible to add them on the global plant schema but it means
that the schema may be too heavy to view. It might also be convenient to have
them "popup" when the mouse gets over their corresponding part: these are called
"zoomable elements". The idea of "zoomable elements" is to save "visible space"
on the device used for selection by displaying a detailed element in front of
the global element used to navigate on the whole plant.

Elements (groups) that can be zoomed must have a "class" attribute containing
the value "brapi-zoomable" and their "name" attribute must begin with the name
attribute of the area triggering the zoom followed by "-target". It might be
convenient to add a background element as part of the zoomable element since the
zoomable element will be hidden again once the mouse cursor leaves the area. The
zoomed group must be in a layer above its trigger.
The triggering area must have a "class" attribute containing the value
"brapi-zoom-trigger". The triggering area could be transparent but not invisible
or hidden as they must be able to capture mouse or touch events. The
"brapi-transparent" style class can be used to set the triggering element
opacity to 0 (transparent).

### Inkscape tricks
One of the best SVG editors available for free is Inkscape. Here are some tricks
to help in the creation of plant schemas.

When dealing with zoomable elements, it might be convenient to separate them in
layers. The "main" layer will be used for the whole plant  schema and every
zoomable part will be held in separate layers. Inkscape just creates layers as
SVG groups with some specific attributes. The zoomable element layers must be
above the main layer. To set the "name" attribute of a zoomable element layer,
you need to use the "Edit > XML Editor" menu and select an element of the layer.
Then, you will navigate in the XML view to find the parent svg:g element that
has the name of your layer in a "inkscape:label" attribute with an id similar to
"layer#" (where "#" is a number). From there, you can add (define) a name
attribute with a value like "something-target" (where "something" is your
trigger name).

As specified, SVG elements should not contain "transformation" attributes. Such
attributes define transformation made to a base object rather than keeping the
final transformed object in the SVG. Since the interface may need to zoom some
elements (zoomable elements) or use some other transformations in the future,
any element having "transformation" attributes will not behave correctly. But
when you use Inkscape, by default, it will add a list of transformations to
elements you modify instead of saving the final coordinates of each point. To
fully apply the transformations and remove the "transformation" attribute, you
could either use the "apply transforms" plugin
(https://github.com/Klowner/inkscape-applytransforms) or you will have to
ungroup and regroup each element which group has a "transform" attribute.
Note: by ungrouping-regrouping, you will lose any attribute added to the group
such as "name" and "class".

Once you’ve finished creating your plant schema, you will have to remove many
useless annotations added by Inkscape. To do so, just use "save as..." and
select the file format "Simple SVG" instead of "Inkscape SVG. Note: you should
keep a copy of your SVG file with Inkscape annotation as a source file for
future modifications.

## Authors and Support
### Authors:
- Mirella Flores Gonzalez (mrf252@cornell.edu)
- Valentin Guignon (v.guignon@cgiar.org)

### Support
Repport issues on github:
  https://github.com/solgenomics/BrAPI-Trait-selector/issues
