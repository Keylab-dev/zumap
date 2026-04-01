import React, {createRef, useEffect} from 'react';
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

          <Card>
            <CardIcon>
              <FontAwesomeIcon icon={faKeyboard} />
            </CardIcon>
            <CardTitle>Hundreds of keyboards</CardTitle>
            <CardDesc>
              Supports a growing database of mechanical keyboards. If your board
              runs VIA-compatible firmware, it works here.
            </CardDesc>
          </Card>

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
