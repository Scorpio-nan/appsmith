import { Popover2 } from "@blueprintjs/popover2";
import { useFilteredFileOperations } from "components/editorComponents/GlobalSearch/GlobalSearchHooks";
import {
  comboHelpText,
  SEARCH_CATEGORY_ID,
  SEARCH_ITEM_TYPES,
} from "components/editorComponents/GlobalSearch/utils";
import styled from "constants/DefaultTheme";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentPageId,
  selectCurrentApplicationSlug,
  selectPageSlugToIdMap,
} from "selectors/editorSelectors";
import EntityAddButton from "../Entity/AddButton";
import { ReactComponent as SearchIcon } from "assets/icons/ads/search.svg";
import { ReactComponent as CrossIcon } from "assets/icons/ads/cross.svg";
import classNames from "classnames";
import keyBy from "lodash/keyBy";
import { AppState } from "reducers";
import { EntityIcon, getPluginIcon } from "../ExplorerIcons";
import SubmenuHotKeys from "./SubmenuHotkeys";
import scrollIntoView from "scroll-into-view-if-needed";
import { Colors } from "constants/Colors";
import { Position } from "@blueprintjs/core";
import { TOOLTIP_HOVER_ON_DELAY } from "constants/AppConstants";
import { EntityClassNames } from "../Entity";
import TooltipComponent from "components/ads/Tooltip";
import { ADD_QUERY_JS_BUTTON, createMessage } from "ce/constants/messages";

const SubMenuContainer = styled.div`
  width: 250px;
  box-shadow: 0px 24px 48px -12px rgba(16, 24, 40, 0.25);
  .ops-container {
    max-height: 220px;
    overflow: hidden;
    overflow-y: auto;
    div.active {
      background: ${Colors.GREY_2};
    }
    > div:not(.section-title) {
      &: hover {
        background: ${Colors.GREY_2};
      }
    }
  }
`;

type SubMenuProps = { className: string };

export default function ExplorerSubMenu({ className }: SubMenuProps) {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const fileOperations = useFilteredFileOperations(query);
  const pageId = useSelector(getCurrentPageId);
  const applicationSlug = useSelector(selectCurrentApplicationSlug);
  const pageIdToSlugMap = useSelector(selectPageSlugToIdMap);
  const dispatch = useDispatch();
  const plugins = useSelector((state: AppState) => {
    return state.entities.plugins.list;
  });
  const pluginGroups = useMemo(() => keyBy(plugins, "id"), [plugins]);
  const [activeItemIdx, setActiveItemIdx] = useState(0);

  useEffect(() => {
    setQuery("");
  }, [show]);

  useEffect(() => {
    const element = document.getElementById(`file-op-${activeItemIdx}`);
    if (element)
      scrollIntoView(element, {
        scrollMode: "if-needed",
      });
  }, [activeItemIdx]);

  const handleUpKey = useCallback(() => {
    setActiveItemIdx((currentActiveIndex) => {
      if (currentActiveIndex <= 0) return fileOperations.length - 1;
      const offset =
        fileOperations[currentActiveIndex - 1].kind ===
        SEARCH_ITEM_TYPES.sectionTitle
          ? 2
          : 1;
      return Math.max(currentActiveIndex - offset, 0);
    });
  }, [fileOperations]);

  const handleDownKey = useCallback(() => {
    setActiveItemIdx((currentActiveIndex) => {
      if (currentActiveIndex >= fileOperations.length - 1) return 0;
      const offset =
        fileOperations[currentActiveIndex + 1].kind ===
        SEARCH_ITEM_TYPES.sectionTitle
          ? 2
          : 1;
      return Math.min(currentActiveIndex + offset, fileOperations.length - 1);
    });
  }, [fileOperations]);

  const onChange = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  const handleSelect = () => {
    const item = fileOperations[activeItemIdx];
    handleClick(item);
  };

  const handleClick = useCallback(
    (item: any) => {
      if (item.kind === SEARCH_ITEM_TYPES.sectionTitle) return;
      if (item.action) {
        dispatch(item.action(pageId, "SUBMENU"));
      } else if (item.redirect) {
        item.redirect(
          applicationSlug,
          pageIdToSlugMap[pageId],
          pageId,
          "SUBMENU",
        );
      }
      setShow(false);
    },
    [pageId, dispatch, setShow],
  );

  return (
    <Popover2
      canEscapeKeyClose
      className="file-ops"
      content={
        <SubmenuHotKeys
          handleDownKey={handleDownKey}
          handleSubmitKey={handleSelect}
          handleUpKey={handleUpKey}
        >
          <SubMenuContainer className="bg-white overflow-y-auto overflow-x-hidden pb-2 flex flex-col justify-start z-10 delay-150 transition-all">
            <div className="px-4 py-2 text-sm font-medium text-gray">
              CREATE NEW
            </div>
            <div className="flex items-center space-x-2 px-4">
              <SearchIcon className="box-content w-4 h-4" />
              <input
                autoComplete="off"
                autoFocus
                className="flex-grow text-sm py-2 text-gray-800 bg-transparent placeholder-trueGray-500"
                onChange={onChange}
                placeholder="Search datasources"
                type="text"
                value={query}
              />
              {query && (
                <button
                  className="p-1 hover:bg-trueGray-200"
                  onClick={() => setQuery("")}
                >
                  <CrossIcon className="w-3 h-3 text-trueGray-100" />
                </button>
              )}
            </div>
            <div className="ops-container">
              {fileOperations.map((item: any, idx: number) => {
                const icon =
                  item.icon ||
                  (item.pluginId && (
                    <EntityIcon>
                      {getPluginIcon(pluginGroups[item.pluginId])}
                    </EntityIcon>
                  ));
                return (
                  <div
                    className={classNames({
                      "px-4 py-2 text-sm flex gap-2 t--file-operation": true,
                      "cursor-pointer":
                        item.kind !== SEARCH_ITEM_TYPES.sectionTitle,
                      active:
                        activeItemIdx === idx &&
                        item.kind !== SEARCH_ITEM_TYPES.sectionTitle,
                      "font-medium text-gray section-title":
                        item.kind === SEARCH_ITEM_TYPES.sectionTitle,
                    })}
                    id={`file-op-${idx}`}
                    key={`file-op-${idx}`}
                    onClick={() => handleClick(item)}
                  >
                    {icon && <span className="flex-shrink-0">{icon}</span>}
                    <span className="overflow-hidden whitespace-nowrap overflow-ellipsis">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </SubMenuContainer>
        </SubmenuHotKeys>
      }
      isOpen={show}
      minimal
      onClose={() => setShow(false)}
      placement="right-start"
    >
      <TooltipComponent
        boundary="viewport"
        className={EntityClassNames.TOOLTIP}
        content={
          <>
            {createMessage(ADD_QUERY_JS_BUTTON)} (
            {comboHelpText[SEARCH_CATEGORY_ID.ACTION_OPERATION]})
          </>
        }
        disabled={show}
        hoverOpenDelay={TOOLTIP_HOVER_ON_DELAY}
        position={Position.RIGHT}
      >
        <EntityAddButton className={className} onClick={() => setShow(true)} />
      </TooltipComponent>
    </Popover2>
  );
}
