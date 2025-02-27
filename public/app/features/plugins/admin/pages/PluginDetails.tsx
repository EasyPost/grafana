import React, { useState } from 'react';
import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, TabsBar, TabContent, Tab, Icon } from '@grafana/ui';

import { VersionList } from '../components/VersionList';
import { InstallControls } from '../components/InstallControls';
import { usePlugin } from '../hooks/usePlugins';
import { Page as PluginPage } from '../components/Page';
import { Loader } from '../components/Loader';
import { Page } from 'app/core/components/Page/Page';
import { PluginLogo } from '../components/PluginLogo';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

type PluginDetailsProps = GrafanaRouteComponentProps<{ pluginId?: string }>;

export default function PluginDetails({ match }: PluginDetailsProps): JSX.Element | null {
  const { pluginId } = match.params;

  const [tabs, setTabs] = useState([
    { label: 'Overview', active: true },
    { label: 'Version history', active: false },
  ]);

  const { isLoading, plugin } = usePlugin(pluginId!);
  const styles = useStyles2(getStyles);

  if (isLoading) {
    return (
      <Page>
        <Loader />
      </Page>
    );
  }

  if (plugin) {
    return (
      <Page>
        <PluginPage>
          <div className={styles.headerContainer}>
            <PluginLogo
              src={plugin.info.logos.small}
              className={css`
                object-fit: cover;
                width: 100%;
                height: 68px;
                max-width: 68px;
              `}
            />

            <div className={styles.headerWrapper}>
              <h1>{plugin.name}</h1>
              <div className={styles.headerLinks}>
                <a className={styles.headerOrgName} href={'/plugins'}>
                  {plugin.orgName}
                </a>
                {plugin.links.map((link: any) => (
                  <a key={link.name} href={link.url}>
                    {link.name}
                  </a>
                ))}
                {plugin.downloads > 0 && (
                  <span>
                    <Icon name="cloud-download" />
                    {` ${new Intl.NumberFormat().format(plugin.downloads)}`}{' '}
                  </span>
                )}
                {plugin.version && <span>{plugin.version}</span>}
              </div>
              <p>{plugin.description}</p>
              <InstallControls plugin={plugin} />
            </div>
          </div>
          <TabsBar>
            {tabs.map((tab, key) => (
              <Tab
                key={key}
                label={tab.label}
                active={tab.active}
                onChangeTab={() => {
                  setTabs(tabs.map((tab, index) => ({ ...tab, active: index === key })));
                }}
              />
            ))}
          </TabsBar>
          <TabContent>
            {tabs.find((_) => _.label === 'Overview')?.active && (
              <div
                className={styles.readme}
                dangerouslySetInnerHTML={{
                  __html: plugin?.readme ?? 'No plugin help or readme markdown file was found',
                }}
              />
            )}
            {tabs.find((_) => _.label === 'Version history')?.active && (
              <VersionList versions={plugin?.versions ?? []} />
            )}
          </TabContent>
        </PluginPage>
      </Page>
    );
  }

  return null;
}

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    headerContainer: css`
      display: flex;
      margin-bottom: 24px;
      margin-top: 24px;
      min-height: 120px;
    `,
    headerWrapper: css`
      margin-left: ${theme.spacing(3)};
    `,
    headerLinks: css`
      display: flex;
      align-items: center;
      margin-top: ${theme.spacing()};
      margin-bottom: ${theme.spacing(3)};

      & > * {
        &::after {
          content: '|';
          padding: 0 ${theme.spacing()};
        }
      }
      & > *:last-child {
        &::after {
          content: '';
          padding-right: 0;
        }
      }
      font-size: ${theme.typography.h4.fontSize};
    `,
    headerOrgName: css`
      font-size: ${theme.typography.h4.fontSize};
    `,
    readme: css`
      padding: ${theme.spacing(3, 4)};

      & img {
        max-width: 100%;
      }

      h1,
      h2,
      h3 {
        margin-top: ${theme.spacing(3)};
        margin-bottom: ${theme.spacing(2)};
      }

      *:first-child {
        margin-top: 0;
      }

      li {
        margin-left: ${theme.spacing(2)};
        & > p {
          margin: ${theme.spacing()} 0;
        }
      }
    `,
  };
};
