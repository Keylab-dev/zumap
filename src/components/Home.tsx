import React, {createRef, useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import {getByteForCode} from '../utils/key';
import {startMonitoring, usbDetect} from '../utils/usb-hid';
import {
  getLightingDefinition,
  isVIADefinitionV2,
  isVIADefinitionV3,
  LightingValue,
} from '@the-via/reader';
import {
  getConnectedDevices,
  getSelectedKeyboardAPI,
} from 'src/store/devicesSlice';
import {
  loadSupportedIds,
  reloadConnectedDevices,
} from 'src/store/devicesThunks';
import {getDisableFastRemap} from '../store/settingsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  getSelectedKey,
  getSelectedLayerIndex,
  updateSelectedKey as updateSelectedKeyAction,
} from 'src/store/keymapSlice';
import {
  getBasicKeyToByte,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {OVERRIDE_HID_CHECK} from 'src/utils/override';
import {KeyboardValue} from 'src/utils/keyboard-api';
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faKeyboard, faPlug, faGlobe, faCodeBranch} from '@fortawesome/free-solid-svg-icons';
import {faChrome} from '@fortawesome/free-brands-svg-icons';

const WelcomeHome = styled.div`
  background: var(--bg_gradient);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 100;
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 3rem;
  color: var(--color_label);
  width: 100%;
  box-sizing: border-box;
`;

const Logo = styled.h1`
  font-family: 'Fira Sans Condensed', sans-serif;
  font-weight: 500;
  font-size: 2.5rem;
  letter-spacing: 0.1em;
  margin: 0 0 0.5rem;
  color: var(--color_accent);
`;

const Tagline = styled.p`
  font-size: 1.1rem;
  color: var(--color_label);
  opacity: 0.7;
  margin: 0 0 3rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  max-width: 720px;
  width: 100%;
  margin-bottom: 3rem;
`;

const Card = styled.div`
  background: var(--bg_control);
  border: 1px solid var(--border_color_cell);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CardIcon = styled.div`
  font-size: 1.25rem;
  color: var(--color_accent);
`;

const CardTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
`;

const CardDesc = styled.p`
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.6;
  line-height: 1.5;
`;

const BrowserNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg_control);
  border: 1px solid var(--border_color_cell);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  max-width: 720px;
  width: 100%;
  font-size: 0.85rem;
  opacity: 0.8;
`;

const BrowserIcon = styled.span`
  font-size: 1.1rem;
  color: var(--color_accent);
  flex-shrink: 0;
`;

const Link = styled.a`
  color: var(--color_accent);
  text-decoration: underline;
`;

const ClickableCard = styled(Card)`
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover {
    border-color: var(--color_accent);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardCount = styled.span`
  font-size: 0.8rem;
  opacity: 0.5;
`;

const KeyboardBrowser = styled.div`
  max-width: 720px;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: 0.75rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid var(--border_color_cell);
  border-radius: 8px;
  background: var(--bg_control);
  color: var(--color_label-highlighted);
  font-family: 'Fira Sans', sans-serif;
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  &::placeholder {
    color: var(--color_label);
    opacity: 0.5;
  }
  &:focus {
    border-color: var(--color_accent);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color_label);
  opacity: 0.5;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  &:hover {
    opacity: 1;
  }
`;

const KeyboardList = styled.div`
  max-height: 320px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--border_color_cell);
  border-radius: 8px;
  background: var(--bg_control);
`;

const KeyboardItem = styled.div`
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  color: var(--color_label);
  border-bottom: 1px solid var(--border_color_cell);
  &:last-child {
    border-bottom: none;
  }
`;

const KeyboardCount = styled.div`
  font-size: 0.8rem;
  color: var(--color_label);
  opacity: 0.5;
  padding: 0.5rem 0;
  text-align: center;
`;

const ErrorHome = styled.div`
  background: var(--bg_gradient);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
  height: auto;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 24px;
  position: absolute;
  border-top: 1px solid var(--border_color_cell);
`;

const timeoutRepeater =
  (fn: () => void, timeout: number, numToRepeat = 0) =>
  () =>
    setTimeout(() => {
      fn();
      if (numToRepeat > 0) {
        timeoutRepeater(fn, timeout, numToRepeat - 1)();
      }
    }, timeout);

interface HomeProps {
  children?: React.ReactNode;
  hasHIDSupport: boolean;
}

export const Home: React.FC<HomeProps> = (props) => {
  const {t} = useTranslation();
  const {hasHIDSupport} = props;

  const dispatch = useAppDispatch();
  const selectedKey = useAppSelector(getSelectedKey);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const connectedDevices = useAppSelector(getConnectedDevices);
  const selectedLayerIndex = useAppSelector(getSelectedLayerIndex);
  const selectedKeyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const {basicKeyToByte} = useAppSelector(getBasicKeyToByte);
  const api = useAppSelector(getSelectedKeyboardAPI);

  const updateDevicesRepeat: () => void = timeoutRepeater(
    () => {
      dispatch(reloadConnectedDevices());
    },
    500,
    1,
  );

  const toggleLights = async () => {
    if (!api || !selectedDefinition) {
      return;
    }

    const delay = 200;

    if (
      isVIADefinitionV2(selectedDefinition) &&
      getLightingDefinition(
        selectedDefinition.lighting,
      ).supportedLightingValues.includes(LightingValue.BACKLIGHT_EFFECT)
    ) {
      const val = await api.getRGBMode();
      const newVal = val !== 0 ? 0 : 1;
      for (let i = 0; i < 3; i++) {
        api.timeout(i === 0 ? 0 : delay);
        api.setRGBMode(newVal);
        api.timeout(delay);
        await api.setRGBMode(val);
      }
    }

    if (isVIADefinitionV3(selectedDefinition)) {
      for (let i = 0; i < 6; i++) {
        api.timeout(i === 0 ? 0 : delay);
        await api.setKeyboardValue(KeyboardValue.DEVICE_INDICATION, i);
      }
    }
  };

  const homeElem = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!hasHIDSupport) {
      return;
    }

    if (homeElem.current) {
      homeElem.current.focus();
    }

    startMonitoring();
    usbDetect.on('change', updateDevicesRepeat);
    dispatch(loadSupportedIds());

    return () => {
      // Cleanup function equiv to componentWillUnmount
      usbDetect.off('change', updateDevicesRepeat);
    };
  }, []); // Passing an empty array as the second arg makes the body of the function equiv to componentDidMount (not including the cleanup func)

  useEffect(() => {
    dispatch(updateSelectedKeyAction(null));

    // Only trigger flashing lights when multiple devices are connected
    // if (Object.values(connectedDevices).length > 1) {
    //   toggleLights();
    // }
  }, [api]);

  const [showKeyboards, setShowKeyboards] = useState(false);
  const [keyboards, setKeyboards] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const toggleKeyboards = useCallback(async () => {
    if (showKeyboards) {
      setShowKeyboards(false);
      return;
    }
    if (keyboards.length === 0) {
      try {
        const res = await fetch('/definitions/keyboard_names.json');
        const data: string[] = await res.json();
        setKeyboards(data);
      } catch {
        setKeyboards([]);
      }
    }
    setShowKeyboards(true);
  }, [showKeyboards, keyboards]);

  const filteredKeyboards = search
    ? (() => {
        const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
        const matches = keyboards.filter((k) => {
          const lower = k.toLowerCase();
          return terms.every((term) => lower.includes(term));
        });
        // Score: prioritize word-boundary matches over substring matches
        // and names starting with the first term
        const scored = matches.map((k) => {
          const lower = k.toLowerCase();
          let score = 0;
          for (const term of terms) {
            // Exact word boundary match (e.g. "Q1" matches "Q1" but not "Q10")
            const regex = new RegExp(`(^|[\\s_\\-])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[\\s_\\-])`, 'i');
            if (regex.test(k)) score += 10;
          }
          // Bonus if name starts with first search term
          if (lower.startsWith(terms[0])) score += 5;
          return {name: k, score};
        });
        scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        return scored.map((s) => s.name);
      })()
    : keyboards;

  return !hasHIDSupport && !OVERRIDE_HID_CHECK ? (
    <WelcomeHome ref={homeElem} tabIndex={0}>
      <WelcomeContainer>
        <Logo>ZUMAP</Logo>
        <Tagline>Open-source keyboard configurator</Tagline>

        <CardGrid>
          <Card>
            <CardIcon>
              <FontAwesomeIcon icon={faPlug} />
            </CardIcon>
            <CardTitle>Connect your keyboard</CardTitle>
            <CardDesc>
              Plug in any QMK/VIA-compatible keyboard and remap keys, create
              macros, and adjust lighting — all from your browser.
            </CardDesc>
          </Card>

          <ClickableCard onClick={toggleKeyboards}>
            <CardHeader>
              <CardIcon>
                <FontAwesomeIcon icon={faKeyboard} />
              </CardIcon>
              {keyboards.length > 0 && (
                <CardCount>{keyboards.length} keyboards</CardCount>
              )}
            </CardHeader>
            <CardTitle>Supported keyboards</CardTitle>
            <CardDesc>
              Browse the full list of compatible mechanical keyboards. If your
              board runs VIA-compatible firmware, it works here.
            </CardDesc>
          </ClickableCard>

          <Card>
            <CardIcon>
              <FontAwesomeIcon icon={faCodeBranch} />
            </CardIcon>
            <CardTitle>Community-driven</CardTitle>
            <CardDesc>
              Fork of VIA, actively maintained. Open source and welcoming
              contributions from the keyboard community.
            </CardDesc>
          </Card>
        </CardGrid>

        {showKeyboards && (
          <KeyboardBrowser>
            <SearchWrapper>
              <SearchInput
                type="text"
                placeholder="Search keyboards... (e.g. keychron q1)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <ClearButton onClick={() => setSearch('')} aria-label="Clear search">
                  ×
                </ClearButton>
              )}
            </SearchWrapper>
            <KeyboardList>
              {filteredKeyboards.slice(0, 100).map((name, idx) => (
                <KeyboardItem key={`${idx}-${name}`}>{name}</KeyboardItem>
              ))}
              {filteredKeyboards.length > 100 && (
                <KeyboardItem style={{opacity: 0.4, textAlign: 'center'}}>
                  Showing 100 of {filteredKeyboards.length} — refine your search
                </KeyboardItem>
              )}
            </KeyboardList>
            <KeyboardCount>
              {search
                ? `${filteredKeyboards.length} of ${keyboards.length} keyboards`
                : `${keyboards.length} keyboards supported`}
            </KeyboardCount>
          </KeyboardBrowser>
        )}

        <BrowserNote>
          <BrowserIcon>
            <FontAwesomeIcon icon={faChrome} />
          </BrowserIcon>
          <span>
            Keyboard connection requires a browser with{' '}
            <Link
              href="https://caniuse.com/?search=webhid"
              target="_blank"
              rel="noopener noreferrer"
            >
              WebHID support
            </Link>
            . Use Chrome or Edge on desktop to connect your keyboard.
          </span>
        </BrowserNote>
      </WelcomeContainer>
    </WelcomeHome>
  ) : (
    <>{props.children}</>
  );
};
