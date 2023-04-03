import { debounce } from 'lodash-es';
import React, {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { mergeRefs } from 'react-merge-refs';

type PolymorphicRef<C extends React.ElementType> =
  ComponentPropsWithRef<C>['ref'];

type BalancedProps<C extends React.ElementType> = PropsWithChildren<{
  as?: C;
  interval?: number;
}> &
  ComponentPropsWithoutRef<C> & { ref?: PolymorphicRef<C> };

type BalancedComponent = (<C extends ElementType = 'div'>(
  props: BalancedProps<C>,
) => ReactElement | null) & { displayName?: string };

const Balanced: BalancedComponent = forwardRef(
  <T extends ElementType = 'div'>(
    { as, interval = 50, children, ...props }: BalancedProps<T>,
    ref: PolymorphicRef<T>,
  ) => {
    const Component = as || 'div';

    const [element, setElement] = useState<
      ComponentPropsWithRef<T>['ref']['current'] | null
    >(null);

    const mergedRef = useMemo(() => mergeRefs([ref, setElement]), [ref]);

    const resize = useMemo(
      () =>
        debounce(
          () => {
            if (!element) return;
            element.style.removeProperty('max-inline-size');
            element.style.boxSizing = 'border-box';

            const computed = window.getComputedStyle(element);

            const writingMode = computed.writingMode;
            const isVertical = writingMode.includes('vertical');
            const clientHeightProp = isVertical
              ? 'clientWidth'
              : 'clientHeight';
            const offsetWidthProp = isVertical ? 'offsetHeight' : 'offsetWidth';

            const blockPadding =
              parseFloat(computed.paddingBlockStart) +
              parseFloat(computed.paddingBlockEnd);
            const inlinePadding =
              parseFloat(computed.paddingInlineStart) +
              parseFloat(computed.paddingInlineEnd);

            const contentHeight = element[clientHeightProp] - blockPadding;
            const lineHeight = parseFloat(computed.lineHeight);
            if (contentHeight <= lineHeight) return;

            let min = inlinePadding;
            let max = element[offsetWidthProp];
            let mid = max * 0.8;

            while (min < max) {
              element.style.maxInlineSize = `${mid}px`;
              if (element[clientHeightProp] - blockPadding > contentHeight) {
                min = mid + 1;
              } else {
                max = mid;
              }
              mid = Math.floor((min + max) / 2);
            }
            element.style.maxInlineSize = `${max}px`;
          },
          interval,
          { leading: true, trailing: true },
        ),
      [element, interval],
    );

    useEffect(() => {
      const parent = element?.parentElement;
      if (!parent) return;
      let width = -1;
      const observer = new ResizeObserver(
        ([
          {
            borderBoxSize: [{ inlineSize }],
          },
        ]) => {
          if (inlineSize !== width) {
            width = inlineSize;
            resize();
          }
        },
      );
      observer.observe(parent);
      resize();
      return () => observer.disconnect();
    }, [resize, element]);

    return (
      <Component ref={mergedRef} {...props}>
        {children}
      </Component>
    );
  },
);

Balanced.displayName = 'Balanced';

export default Balanced;
