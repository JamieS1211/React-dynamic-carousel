import React, { useLayoutEffect, useReducer, useState } from "react"
import { animated, useSpring } from "react-spring"

import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft"
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight"

interface IActionMovePrev {
    type: "movePrev"
    payload: {
        onReachStart: IProps["onReachStart"]
    }
}

interface IActionMoveNext {
    type: "moveNext"
    payload: {
        elementCount: number
        onReachEnd: IProps["onReachEnd"]
    }
}

interface IActionSetGalleryWidth {
    type: "setGalleryWidth"
    payload: {
        galleryWidth: number
        elementWidth: IProps["elementWidth"]
        fadeDistance: NonNullable<IProps["fadeDistance"]>
        minPadding: NonNullable<IProps["minPadding"]>
    }
}

const initialState = {
    galleryPosition: 0,
    galleryWidth: 0,
    useableWidth: 0,
    elementsShown: 0,
    excessSpace: 0,
    paddingComponentWidth: 20
}

export type State = typeof initialState

export type Action = IActionMovePrev | IActionMoveNext | IActionSetGalleryWidth

function reducer(state: State, action: Action) {
    switch (action.type) {
        case "movePrev": {
            if (state.galleryPosition > 0) {
                return { ...state, galleryPosition: state.galleryPosition - 1 }
            } else if (action.payload.onReachStart !== undefined) {
                action.payload.onReachStart(state)
            }
            return state
        }
        case "moveNext": {
            if (state.galleryPosition < action.payload.elementCount - state.elementsShown) {
                return { ...state, galleryPosition: state.galleryPosition + 1 }
            } else if (action.payload.onReachEnd !== undefined) {
                action.payload.onReachEnd(state)
            }
            return state
        }
        case "setGalleryWidth": {
            const useableWidth = action.payload.galleryWidth - 2 * action.payload.fadeDistance
            const elementsShown = Math.floor(useableWidth / (action.payload.elementWidth + action.payload.minPadding))
            const excessSpace = useableWidth - action.payload.elementWidth * elementsShown
            const totalComponentPadding = elementsShown < 2 ? 0 : excessSpace / (elementsShown - 1)
            return {
                ...state,
                galleryWidth: action.payload.galleryWidth,
                useableWidth,
                elementsShown,
                excessSpace,
                paddingComponentWidth: totalComponentPadding
            }
        }
        default:
            throw new Error("Invalid action type")
    }
}

export interface IProps {
    tiles: React.ReactNode[]
    elementWidth: number
    fadeDistance?: number
    minPadding?: number
    onReachEnd?: (state?: State) => void
    onReachStart?: (state?: State) => void
}

const HorizontalGallery: React.FC<IProps> = (props) => {
    const { tiles, elementWidth, onReachEnd, onReachStart } = props
    const fadeDistance = props.fadeDistance || 100
    const minPadding = props.minPadding || 20

    const [galleryTrack] = useState(React.createRef<HTMLDivElement>())

    const [state, dispatch] = useReducer(reducer, initialState)

    useLayoutEffect(() => {
        if (galleryTrack !== undefined) {
            const element = galleryTrack.current
            if (element !== null) {
                const updateSize = () =>
                    dispatch({
                        type: "setGalleryWidth",
                        payload: {
                            galleryWidth: element.getBoundingClientRect().width,
                            fadeDistance,
                            elementWidth,
                            minPadding
                        }
                    })

                // This is an instantaneous delay, allowing the page to render a vertical scroll bar if needed,
                // and then take that into account when settings size
                setTimeout(() => updateSize(), 1000)

                window.addEventListener("resize", updateSize)

                return () => window.removeEventListener("resize", updateSize)
            }
        }
    }, [elementWidth, fadeDistance, galleryTrack, minPadding])

    const trackProps = useSpring({
        to: {
            transform: `translate(${fadeDistance - (elementWidth + state.paddingComponentWidth) * state.galleryPosition}px)`
        }
    })

    const paddingProps = useSpring({
        to: {
            paddingRight: state.paddingComponentWidth
        }
    })

    return (
        <div style={{ display: "flex", position: "relative" }}>
            <div style={{ display: "flex", width: "100%", overflow: "hidden" }} ref={galleryTrack}>
                <animated.div style={{ display: "flex", ...trackProps }}>
                    {tiles.map((tile, index) => (
                        <animated.div
                            key={index}
                            style={{
                                ...paddingProps,
                                width: elementWidth,
                                overflow: "hidden",
                                visibility: index > state.galleryPosition - 2 && index < state.galleryPosition + state.elementsShown + 1 ? "visible" : "hidden"
                            }}
                        >
                            {tile}
                        </animated.div>
                    ))}
                </animated.div>
            </div>

            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    left: "0",
                    height: "100%",
                    width: fadeDistance,
                    background: "linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))"
                }}
            >
                <KeyboardArrowLeft
                    style={{ transform: "translate(-110%)", opacity: state.galleryPosition > 0 ? 1 : 0.2 }}
                    onClick={() => dispatch({ type: "movePrev", payload: { onReachStart } })}
                />
            </div>

            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    right: "0",
                    height: "100%",
                    width: fadeDistance,
                    background: "linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))"
                }}
            >
                <KeyboardArrowRight
                    style={{ transform: "translate(110%)", opacity: state.galleryPosition < tiles.length - state.elementsShown ? 1 : 0.2 }}
                    onClick={() =>
                        dispatch({
                            type: "moveNext",
                            payload: { elementCount: tiles.length, onReachEnd }
                        })
                    }
                />
            </div>
        </div>
    )
}

export default HorizontalGallery
