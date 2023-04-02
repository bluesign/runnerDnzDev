import styled from "styled-components"

interface InputBlockProps {
  mb?: string
}

export const InputBlock = styled.div<InputBlockProps>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({mb = "0"}) => mb};
  position: relative;
`


export const Type = styled.span`
  font-weight: normal;
  margin-left: 4px;
  &:before{
    content: "(";
  }
  &:after{
    content: ")";
  }
`

export const Input = styled.input`
  border: 1px solid #C4C4C4;
  border-radius: 5px;
  font-size: 12px;
  color: #000;
  padding: 8px;
  width: 100%;
  
  margin-bottom: 5px;
  &:last-child{
    margin-bottom: 0;
  }
  box-sizing: border-box;

  ::placeholder {
    color: #999;
  }
`;

export const Error = styled.p`
  display: inline;
  font-size: 12px;
  color: red;
`;
