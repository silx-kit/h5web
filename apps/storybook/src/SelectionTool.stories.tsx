import type { Points, Rect, Selection } from '@h5web/lib';
import {
  Box,
  DataToHtml,
  Pan,
  ResetZoomButton,
  SelectionTool,
  SvgCircle,
  SvgElement,
  SvgLine,
  SvgPolyline,
  SvgRect,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { useThrottledState } from '@react-hookz/web';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Vector3 } from 'three';

import FillHeight from './decorators/FillHeight';
import { getTitleForSelection } from './utils';

const meta = {
  title: 'Building Blocks/Interactions/SelectionTool',
  component: SelectionTool,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    modifierKey: [],
  },
  argTypes: {
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} satisfies Meta<typeof SelectionTool>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rectangle = {
  render: (args) => {
    const { modifierKey } = args;

    const [activeSelection, setActiveSelection] = useThrottledState<
      Selection | undefined
    >(undefined, 50);

    return (
      <VisCanvas
        title={getTitleForSelection(activeSelection?.data)}
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan modifierKey={modifierKey?.length === 0 ? 'Control' : undefined} />
        <Zoom />
        <ResetZoomButton />

        <SelectionTool
          {...args}
          onSelectionChange={setActiveSelection}
          onSelectionEnd={() => setActiveSelection(undefined)}
        >
          {({ html: htmlSelection }, _, isValid) => (
            <SvgElement>
              <SvgRect
                coords={htmlSelection}
                fill={isValid ? 'teal' : 'orangered'}
                fillOpacity={0.5}
                stroke={isValid ? 'teal' : 'orangered'}
                strokeWidth={2}
                strokePosition="inside"
              />
            </SvgElement>
          )}
        </SelectionTool>
      </VisCanvas>
    );
  },
} satisfies Story;

export const ModifierKey = {
  ...Rectangle,
  args: {
    modifierKey: 'Control',
  },
} satisfies Story;

export const Validation = {
  ...Rectangle,
  args: {
    validate: ({ html }) => Box.fromPoints(...html).hasMinSize(100),
  },
} satisfies Story;

export const PersistedDataSelection = {
  render: () => {
    const [persistedDataSelection, setPersistedDataSelection] =
      useState<Rect>();

    return (
      <VisCanvas
        title={getTitleForSelection(persistedDataSelection)}
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan modifierKey="Control" />
        <Zoom />
        <ResetZoomButton />

        <SelectionTool
          validate={({ html }) => Box.fromPoints(...html).hasMinSize(50)}
          onSelectionStart={() => setPersistedDataSelection(undefined)}
          onValidSelection={({ data }) =>
            setPersistedDataSelection(data as Rect)
          }
        >
          {({ html: htmlSelection }, _, isValid) => (
            <SvgElement>
              <SvgRect
                coords={htmlSelection}
                fill={isValid ? 'teal' : 'orangered'}
                fillOpacity="0.3"
              />
            </SvgElement>
          )}
        </SelectionTool>

        {persistedDataSelection && (
          <DataToHtml points={persistedDataSelection}>
            {(...htmlSelection) => (
              <SvgElement>
                <SvgRect coords={htmlSelection} fill="teal" fillOpacity="0.6" />
              </SvgElement>
            )}
          </DataToHtml>
        )}
      </VisCanvas>
    );
  },
} satisfies Story;

export const PersistedPolylineSelection = {
  args: {
    minPoints: 3,
  },

  render: (args) => {
    const [persistedPolylineSelection, setPersistedPolylineSelection] =
      useState<Points>();

    const { maxPoints } = { ...args };
    return (
      <VisCanvas
        title={getTitleForSelection(persistedPolylineSelection)}
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan modifierKey="Control" />
        <Zoom />
        <ResetZoomButton />

        <SelectionTool
          {...args}
          validate={({ html }) => {
            return maxPoints === 1 && html.length === 1
              ? true
              : Box.fromPoints(...html).hasMinSize(50);
          }}
          onSelectionStart={() => setPersistedPolylineSelection(undefined)}
          onValidSelection={({ data }) => setPersistedPolylineSelection(data)}
        >
          {({ html: htmlSelection }, _, isValid, isComplete) =>
            maxPoints === 1 ? (
              <SvgElement>
                <SvgCircle
                  coords={[
                    htmlSelection[0],
                    htmlSelection[0].clone().add(new Vector3(3)),
                  ]}
                  fill="teal"
                  fillOpacity="0.3"
                />
              </SvgElement>
            ) : (
              <SvgElement>
                <SvgPolyline
                  coords={htmlSelection}
                  stroke={isValid ? 'teal' : 'orangered'}
                  strokeDasharray={isComplete ? '4 0' : '4'}
                />
              </SvgElement>
            )
          }
        </SelectionTool>

        {persistedPolylineSelection && (
          <DataToHtml points={persistedPolylineSelection}>
            {(...htmlSelection) =>
              maxPoints === 1 ? (
                <SvgElement>
                  <SvgCircle
                    coords={[
                      htmlSelection[0],
                      htmlSelection[0].clone().add(new Vector3(3)),
                    ]}
                    fill="teal"
                    fillOpacity="0.3"
                  />
                </SvgElement>
              ) : (
                <SvgElement>
                  <SvgPolyline coords={htmlSelection} stroke="teal" />
                </SvgElement>
              )
            }
          </DataToHtml>
        )}
      </VisCanvas>
    );
  },
} satisfies Story;

export const LineWithLengthValidation = {
  render: () => {
    const [isValid, setValid] = useThrottledState<boolean | undefined>(
      undefined,
      50
    );

    return (
      <VisCanvas
        title={
          isValid === undefined
            ? 'No selection'
            : `Line is ${isValid ? 'longer' : 'shorter'} than 100px`
        }
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan modifierKey="Control" />
        <Zoom />
        <ResetZoomButton />

        <SelectionTool
          validate={({ html: [start, end] }) => start.distanceTo(end) >= 100}
          onSelectionChange={(selection, _, isValid) =>
            setValid(selection && isValid)
          }
          onSelectionEnd={() => setValid(undefined)}
        >
          {({ html: htmlSelection }, _, isValid) => (
            <SvgElement>
              <SvgLine
                coords={htmlSelection}
                stroke={isValid ? 'teal' : 'orangered'}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </SvgElement>
          )}
        </SelectionTool>
      </VisCanvas>
    );
  },
} satisfies Story;

export const RectWithTransform = {
  render: () => (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan modifierKey="Control" />
      <Zoom />
      <ResetZoomButton />

      <SelectionTool
        transform={({ html: htmlSelection }, camera, context) => {
          const { htmlToWorld, worldToData } = context;

          const box = Box.fromPoints(...htmlSelection);
          box.expandBySize(-box.size.width / 2, 1); // shrink width of selection by two (equally on both side)

          const html = box.toRect();
          const world = html.map((pt) => htmlToWorld(camera, pt));
          const data = world.map(worldToData);
          return { html, world, data };
        }}
      >
        {({ html: htmlSelection }, { html: rawSelection }) => (
          <SvgElement>
            <SvgRect
              coords={rawSelection}
              fill="none"
              stroke="black"
              strokeDasharray={4}
            />
            <SvgRect coords={htmlSelection} fill="teal" fillOpacity={0.8} />
          </SvgElement>
        )}
      </SelectionTool>
    </VisCanvas>
  ),
} satisfies Story;
