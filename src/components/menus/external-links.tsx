import {faDiscord, faGithub} from '@fortawesome/free-brands-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import {ZumapLogo} from '../icons/zumap';
import {CategoryMenuTooltip} from '../inputs/tooltip';
import {CategoryIconContainer} from '../panes/grid';

const ExternalLinkContainer = styled.span`
  position: absolute;
  right: 1em;
  display: flex;
  gap: 1em;
`;

export const ExternalLinks = () => (
  <ExternalLinkContainer>
    <a href="https://caniusevia.com/" target="_blank">
      <CategoryIconContainer>
        <ZumapLogo height="25px" fill="currentColor" />
        <CategoryMenuTooltip>Firmware + Docs</CategoryMenuTooltip>
      </CategoryIconContainer>
    </a>
    <a href="https://github.com/Keylab-dev/zumap" target="_blank">
      <CategoryIconContainer>
        <FontAwesomeIcon size={'xl'} icon={faGithub} />
        <CategoryMenuTooltip>GitHub</CategoryMenuTooltip>
      </CategoryIconContainer>
    </a>
  </ExternalLinkContainer>
);
