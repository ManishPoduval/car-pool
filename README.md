# Linear Car Pool 

> Ever having trouble figuring out the quickest way to pool cabs ?

Linear Car pool uses Google map's Distance API to figure out the best possible way to pool people of locations close to each other in one cab . 
Input a set of locations to pick up, number of cabs and the destination and you're done. Linear Cab Pool will do the rest for you. It'll pool people of similar/ close locations in one cab and even show the quickest road on the map to take. 


### Getting Started

###### Windows

 Clone the repository on your local machine
 
 `git clone https://github.com/ManishPoduval/car-pool.git`

Go to the ShortestPath folder

`cd ShortestPath`

Install the required packages via npm and yarn and build your project via grunt

`npm install`

`yarn install --module-folder=./components`

`grunt build`

Now just open the index.html file.

### Usage

Once you open the index.html file, this is the first view you'll see

You will get to see a map covering your entire screen

![](https://github.com/ManishPoduval/car-pool/blob/master/ShortestPath/src/images/FirstView.png)

Click on the burger icon to the top left to expand the sidebar.

![](https://github.com/ManishPoduval/car-pool/blob/master/ShortestPath/src/images/Sidebar.png)

Enter your destination, your pick up/drop locations, number of cabs available.
You'll get the following image, with the markers populated accordingly. Your destination marker is in green and the rest are in yellow

![](https://github.com/ManishPoduval/car-pool/blob/master/ShortestPath/src/images/EnterLocations.png)

Now to plot the routes on the map click on the Calculate button.
You'll get the routes plotted on the map as well as the locations marked with alphabets indicating the order of the pick up for each route.

![](https://github.com/ManishPoduval/car-pool/blob/master/ShortestPath/src/images/PopulatedRoutes.png)

To know more about a particular location just click on the marker and you'll get an info window with the address

![](https://github.com/ManishPoduval/car-pool/blob/master/ShortestPath/src/images/InfoWindow.png)

### Development

Want to contribute? Great!

To fix a bug or enhance an existing code, follow these steps:

- Fork the repo
- Create a new branch (`git checkout -b my-feature`)
- Make the appropriate changes in the files
- Add changes to reflect the changes made
- Commit your changes (`git commit -am 'My feature <YOUR_NAME>'`)
- Push to the branch (`git push origin my-feature`)
- Create a Pull Request 

### Bug / Feature Request

If you find a bug (the website couldn't handle the query and / or gave undesired results), kindly open an issue [here](https://github.com/ManishPoduval/car-pool/issues/new) by including your search query and the expected result.

If you'd like to request a new function, feel free to do so by opening an issue [here](https://github.com/ManishPoduval/car-pool/issues/new). Please include sample queries and their corresponding results.



## Built with 

- [Google Maps API](https://developers.google.com/maps/web-services/) - The Google Maps web services are a collection of HTTP interfaces to Google services providing geographic data for your maps applications
- [Bootstrap](http://getbootstrap.com/) - Extensive list of components and  Bundled Javascript plugins.
- [KnockoutJs](http://knockoutjs.com/) - Knockout is a JavaScript MVVM (a modern variant of MVC) library that makes it easier to create rich, desktop-like user interfaces with JavaScript and HTML.
- [GruntJs](https://gruntjs.com/) - GruntJS is a JavaScript based command line build tool that helps developers automate repetitive tasks.
- [RequireJs](http://requirejs.org/) - Image result for what is requirejsgithub.com
                  RequireJS is a JavaScript file and module loader.

## [License](https://github.com/ManishPoduval/car-pool/blob/master/LICENSE.md)

MIT © [Manish Poduval](https://github.com/ManishPoduval)