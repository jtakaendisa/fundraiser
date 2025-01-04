import { colors } from '@/app/constants';

interface Props {
  fill?: string;
  size?: number;
}

const { darkGray } = colors;

const Heart = ({ fill = darkGray, size = 20 }: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 448"
      width={size}
      height={size}
      fill={fill}
    >
      <path d="M256 109.3L233.4 86.7L209.1 62.4C189.7 42.9 163.3 32 135.8 32C78.5 32 32 78.5 32 135.8C32 163.3 42.9 189.7 62.4 209.2L86.6 233.4L256 402.8L425.4 233.4L449.6 209.2C469.1 189.7 480 163.3 480 135.8C480 78.5 433.5 32 376.2 32C348.7 32 322.3 42.9 302.8 62.4L278.6 86.6L256 109.3ZM278.6 425.4L256 448L233.4 425.4L64 256L39.8 231.8C14.3 206.3 0 171.8 0 135.8C0 60.8 60.8 0 135.8 0C171.8 0 206.3 14.3 231.8 39.8L233.4 41.4L256 64L278.6 41.4L280.2 39.8C305.7 14.3 340.2 0 376.2 0C451.2 0 512 60.8 512 135.8C512 171.8 497.7 206.3 472.2 231.8L448 256L278.6 425.4Z" />
    </svg>
  );
};

export default Heart;
