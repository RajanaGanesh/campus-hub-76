import React from 'react';
import { Button, ButtonProps } from './Button';

export const GradientButton: React.FC<ButtonProps> = ({
  className = '',
  ...props
}) => {
  return (
    <Button
      variant="gradient"
      className={`c1-btn-gradient-glow ${className}`}
      {...props}
    />
  );
};
