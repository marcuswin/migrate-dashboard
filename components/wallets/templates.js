import React from 'react';
import styled from 'styled-components';
import { useSpring, animated, config } from 'react-spring';

const animations = {
  fade: [{ opacity: 0 }, { opacity: 1 }],
  fadeUp: [
    {
      opacity: 0,
      transform: 'scale(0.99) translate3d(0, 10px, 0)'
    },
    {
      opacity: 1,
      transform: 'scale(1) translate3d(0, 0, 0)'
    }
  ]
};

const SimpleBg = styled(Bg)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BasicModal = ({ show, onClose, modalProps, children }) => {
  if (!show) return null;
  const [fadeStart, fadeEnd] = animations.fade;
  const [fadeUpStart, fadeUpEnd] = animations.fadeUp;

  const ModalContent = styled(animated.div)`
    background-color: white;
    border-radius: 6px;
    padding: ${({ theme }) => theme.space.m}px;
    box-shadow: 0px 3px 13px rgba(67, 67, 67, 0.13);
  `;

  const [bgAnimation, setBgAnimation] = useSpring(() => ({
    to: fadeEnd,
    from: fadeStart,
    config: config.stiff
  }));

  const [contentAnimation, setContentAnimation] = useSpring(() => ({
    to: fadeUpEnd,
    from: fadeUpStart,
    config: config.stiff
  }));

  const onCloseAnimated = () => {
    setBgAnimation({
      to: fadeStart
    });

    setContentAnimation({
      to: fadeUpStart,
      onRest() {
        onClose();
      }
    });
  };

  return (
    <SimpleBg
      onClick={onCloseAnimated}
      css={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}
      style={bgAnimation}
    >
      <ModalContent style={contentAnimation} onClick={e => e.stopPropagation()}>
        {children({ ...modalProps, onClose: onCloseAnimated })}
      </ModalContent>
    </SimpleBg>
  );
};

const templates = {
  basic: BasicModal,
  default: BasicModal
};

export default templates;
