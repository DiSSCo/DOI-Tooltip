# DOI-Tooltip
 
This DOI Tooltip component can be incorporated into a web application to show details about Digital Specimen DOIs, for example in a scientific paper that references the DOI. A demo can be found [here](https://dev.dissco.tech/demo). It makes use of the metadata in the DOI record itself without having to get the full Digital Specimen record to which the DOI redirects (using the ?noredirect option provided by the Handle system).

## Variants

There are multiple variants of the Tooltip:

1. The plain HTML Tooltip. This Tooltip can be incorporated into any website. It makes use of HTML, CSS and a small Javascript portion to fetch data from the DOI API and display it.

2. The React optimized Tooltip. This Tooltip is built to be used within the React framework and makes use of its internal hooks. Using this component is as easy as including the component file in your project, importing it and referencing it in the code. The Tooltip will be applied to the children, passed to the component.
