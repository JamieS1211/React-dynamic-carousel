import React, { useLayoutEffect, useReducer, useRef } from "react"
import { animated, useSpring } from "react-spring"

import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft"
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight"

const initialState = {
    galleryPosition: 0,
    galleryWidth: 0,
    useableWidth: 0,
    elementsShown: 0,
    excessSpace: 0,
    paddingComponentWidth: 1000
}

export interface IState {
    galleryPosition: number
    galleryWidth: number
    useableWidth: number
    elementsShown: number
    excessSpace: number
    paddingComponentWidth: number
}

export interface IAction {
    type: string
    payload: {
        elementCount?: number
        onReachStart?: (arg0: IState) => void
        onReachEnd?: (arg0: IState) => void
        galleryWidth?: number
        fadeDistance?: number
        elementWidth?: number
        minPadding?: number
    }
}

export interface IProps {
    tiles: React.ReactNode[]
    elementWidth: number
    fadeDistance?: number
    minPadding?: number
    onReachEnd?: () => void
    onReachStart?: () => void
}

function reducer(state: IState, action: IAction) {
    switch (action.type) {
        case "movePrev":
            if (state.galleryPosition > 0) {
                return { ...state, galleryPosition: state.galleryPosition - 1 }
            } else if (action.payload.onReachStart !== undefined) {
                action.payload.onReachStart(state)
            }
            return state
        case "moveNext":
            if (state.galleryPosition < action.payload.elementCount - state.elementsShown) {
                return { ...state, galleryPosition: state.galleryPosition + 1 }
            } else if (action.payload.onReachEnd !== undefined) {
                action.payload.onReachEnd(state)
            }
            return state
        case "setGalleryWidth":
            const useableWidth = state.galleryWidth - 2 * action.payload.fadeDistance
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
        default:
            throw new Error("Invalid action type")
    }
}

const HorizontalGallery: React.FC<IProps> = (props) => {
    const fadeDistance = props.fadeDistance === undefined ? 100 : props.fadeDistance
    const elementWidth = props.elementWidth
    const minPadding = props.minPadding === undefined ? 0 : props.minPadding

    const galleryTrack = useRef(null)

    const [state, dispatch] = useReducer(reducer, initialState)

    useLayoutEffect(() => {
        if (galleryTrack && galleryTrack.current) {
            const updateSize = () =>
                dispatch({
                    type: "setGalleryWidth",
                    payload: {
                        galleryWidth: galleryTrack.current.getBoundingClientRect().width,
                        fadeDistance,
                        elementWidth,
                        minPadding
                    }
                })

            // This is an instantaneous delay, allowing the page to render a vertical scroll bar if needed,
            // and then take that into account when settings size
            setTimeout(() => updateSize(), 0)

            window.addEventListener("resize", updateSize)

            return () => window.removeEventListener("resize", updateSize)
        }
        // Removing galleryTrack.current causes issues
        // eslint-disable-next-line
    }, [galleryTrack.current, fadeDistance, elementWidth, minPadding, dispatch])

    const trackProps = useSpring({
        to: {
            transform: `translate(${fadeDistance - (elementWidth + state.paddingComponentWidth) * state.galleryPosition}px)`
        }
    })
    const paddingProps = useSpring({
        to: {
            width: state.paddingComponentWidth
        }
    })

    return (
        <div style={{ display: "flex", position: "relative" }}>
            <div style={{ display: "flex", width: "100%", overflow: "hidden" }} ref={galleryTrack}>
                <animated.div style={{ display: "flex", ...trackProps }}>
                    {props.tiles.map((tile: Node, index: number) => (
                        <React.Fragment key={index}>
                            {index > 0 && <animated.div style={paddingProps} />}
                            {tile}
                        </React.Fragment>
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
                    background: `linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))`
                }}
            >
                <KeyboardArrowLeft
                    style={{ transform: `translate(-110%)`, opacity: state.galleryPosition > 0 ? 1 : 0.2 }}
                    onClick={() => dispatch({ type: "movePrev", payload: { onReachStart: props.onReachStart } })}
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
                    background: `linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))`
                }}
            >
                <KeyboardArrowRight
                    style={{ transform: `translate(110%)`, opacity: state.galleryPosition < props.tiles.length - state.elementsShown ? 1 : 0.2 }}
                    onClick={() =>
                        dispatch({
                            type: "moveNext",
                            payload: { elementCount: props.tiles.length, onReachEnd: props.onReachEnd }
                        })
                    }
                />
            </div>
        </div>
    )
}

export default HorizontalGallery
