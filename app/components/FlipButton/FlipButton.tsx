import { useState } from 'react';
import { motion } from 'framer-motion';

import { colors } from '@/app/constants';
import SlideUpText from '../SlideUpText/SlideUpText';

import styles from './FlipButton.module.scss';

interface Props {
  children: string;
  textColor1?: string;
  textColor2?: string;
  backgroundColor1?: string;
  backgroundColor2?: string;
  borderColor?: string;
  onClick: () => void;
}

const hoverVariants = {
  initial: {
    y: '100%',
  },
  hovered: {
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const { whiteSolid, darkGreen, lightGray } = colors;

const FlipButton = ({
  children,
  textColor1 = darkGreen,
  textColor2 = whiteSolid,
  backgroundColor1 = lightGray,
  backgroundColor2 = darkGreen,
  borderColor = darkGreen,
  onClick,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const toggleHoverState = () => setIsHovered((prev) => !prev);

  const color = isHovered ? textColor2 : textColor1;

  return (
    <motion.div
      onPointerEnter={toggleHoverState}
      onPointerLeave={toggleHoverState}
      initial="initial"
      whileHover="hovered"
      className={styles.button}
      style={{ backgroundColor: backgroundColor1, borderColor }}
    >
      {/* Animated Background Sheet*/}
      <motion.div
        variants={hoverVariants}
        className={styles.duplicate}
        style={{ backgroundColor: backgroundColor2 }}
      />

      {/* Main Text */}
      <span onClick={onClick} style={{ color }}>
        <SlideUpText playAnimation={isHovered}>{children}</SlideUpText>
      </span>
    </motion.div>
  );
};

export default FlipButton;
