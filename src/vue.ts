import { defineComponent, h, type PropType } from 'vue';
import { select, renderInner, type Shape } from './index';

export const Vicon = defineComponent({
  name: 'Vicon',
  props: {
    value: { type: String, required: true },
    size: { type: Number, default: 128 },
    shape: { type: String as PropType<Shape>, default: 'rounded' },
    title: { type: String, default: undefined },
  },
  setup(props) {
    return () =>
      h('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 100 100',
        width: props.size,
        height: props.size,
        role: 'img',
        'aria-label': props.title ?? props.value,
        innerHTML: renderInner(select(props.value), props.shape),
      });
  },
});
export default Vicon;
