# React-dynamic-carousel
Create multi element carousels in react with smart sizes

Rective-carousel takes in a number of fixed with "tiles" and renders them in a horizontal scrolling carousel, dynamically adjusting the spacing between tiles to keep a clean UI effect.

## Installation
**NPM**: `npm install react-dynamic-carousel`

## Example
[![Image from Gyazo](https://i.gyazo.com/7063685d6a46d9ed5ab00df10e963fc0.gif)](https://gyazo.com/7063685d6a46d9ed5ab00df10e963fc0)

## Usage

```js
import HorizontalGallery from 'react-dynamic-carousel'

const example = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

<HorizontalGallery
    tiles={example.map((value) => (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 250,
                height: 350,
                backgroundColor: '#D0D0D0',
                borderRadius: 10
            }}
        >
            <h1>{value}</h1>
        </div>
    ))}
    elementWidth={250}
    fadeDistance={100}
    minPadding={20}
/>
```

## Props

- [tiles](#tiles): `Node[]` 
- [elementWidth](#elementWidth): `number`
- [fadeDistance](#fadeDistance)?: `number`
- [minPadding](#minPadding)?: `number`
- [onReachEnd](#onReachEnd)?: `(GalleryState) => void`
- [onReachStart](#onReachStart)?: `(GalleryState) => void`

#### tiles
`tiles: Node[]`

This is the array of DOM Nodes for the tiles that you want to be rendered


#### elementWidth
`elementWidth: number`

This is the width of each element in pixels


#### fadeDistance
`fadeDistance?: number`
Default is `100`

This denotes the size of the opacity fade at the edge of each. Use this to preview the next / previous tile at the the corresponding sides


#### minPadding
`minPadding?: number`
Default is `10`

This gives the minimum padding size in pixels between tiles used to calculate actual pading when resizing the page


#### onReachEnd
`onReachEnd?: (GalleryState) => void`
Default is `() => void`

This callback is fired when the next button is pressed when already at the end


#### onReachStart
`onReachStart?: (GalleryState) => void`
Default is `() => void`

This callback is fired when the previous button is pressed when already at the start


## GalleryState
- [galleryPosition](#galleryPosition): `number`
- [galleryWidth](#galleryWidth): `number`
- [useableWidth](#useableWidth): `number`
- [elementsShown](#elementsShown): `number`
- [excessSpace](#excessSpace): `number`
- [paddingComponentWidth](#paddingComponentWidth): `number`

#### galleryPosition
This is the index of the furthest left element

#### galleryWidth
This is the current total track width

#### useableWidth
This is the remaining width after accounting for the fadeDistance

#### elementsShown
This is the current number of elements shown

#### excessSpace
This is the amount useable space leftover after placing the elements in the track in pixels

#### paddingComponentWidth
This is the spacing between each element in pixels, this will always be equal to or greater than the [minPadding](#minPadding)
