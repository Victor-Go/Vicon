import { createElement, memo, type SVGProps } from 'react';
import { select, renderInner, type ViconOptions } from './index';

export interface ViconProps extends ViconOptions, Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /** Any string: user id, email, hash... The same value always gives the same icon. */
  value: string;
}

export const Vicon = memo(function Vicon({ value, size = 128, shape = 'rounded', title, ...rest }: ViconProps) {
  return createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 100 100',
    width: size,
    height: size,
    role: 'img',
    'aria-label': title ?? value,
    ...rest,
    dangerouslySetInnerHTML: { __html: renderInner(select(value), shape) },
  });
});
