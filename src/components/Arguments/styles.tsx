import styled from "styled-components";

export const DragBox = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    z-index: -1;
`

export const DragMe = styled.div`
    position: absolute;
    right:20px;
    top:50px;
    width: fit-content;
    height: fit-content;
    z-index: 1000;
`
