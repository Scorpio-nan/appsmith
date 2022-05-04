import { startCase } from "lodash";
import classNames from "classnames";
import React, { useState } from "react";
import styled from "styled-components";

import { AppTheme } from "entities/AppTheming";
import TooltipComponent from "components/ads/Tooltip";
import ColorPickerComponent from "components/ads/ColorPickerComponentV2";

interface ThemeColorControlProps {
  theme: AppTheme;
  updateTheme: (theme: AppTheme) => void;
}

const ColorBox = styled.div<{
  background: string;
}>`
  background: ${({ background }) => background};
`;

function ThemeColorControl(props: ThemeColorControlProps) {
  const { theme, updateTheme } = props;
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const userDefinedColors = theme.properties.colors;

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        {Object.keys(theme.properties.colors).map(
          (colorName: string, index: number) => {
            return (
              <TooltipComponent content={startCase(colorName)} key={index}>
                <ColorBox
                  background={userDefinedColors[colorName]}
                  className={classNames({
                    "w-6 h-6 rounded-full border-2 cursor-pointer ring-gray-700": true,
                    "ring-1": selectedColor === colorName,
                  })}
                  onClick={() => {
                    setSelectedColor(
                      colorName !== selectedColor ? colorName : null,
                    );
                  }}
                />
              </TooltipComponent>
            );
          },
        )}
      </div>
      {selectedColor && (
        <div className="pt-1">
          <ColorPickerComponent
            autoFocus
            changeColor={(color: string) => {
              updateTheme({
                ...theme,
                properties: {
                  ...theme.properties,
                  colors: {
                    ...theme.properties.colors,
                    [selectedColor]: color,
                  },
                },
              });
            }}
            color={userDefinedColors[selectedColor]}
            key={selectedColor}
          />
        </div>
      )}
    </div>
  );
}

export default ThemeColorControl;
