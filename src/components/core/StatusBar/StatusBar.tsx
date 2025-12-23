import React, {useCallback, useEffect, useState} from 'react';
import {editor, MarkerSeverity} from 'monaco-editor';
import config, {RuntimeType} from '~/services/config';
import EllipsisText from '~/components/utils/EllipsisText';
import StatusBarItem from '~/components/core/StatusBar/StatusBarItem';
import EnvironmentSelectModal from '~/components/modals/EnvironmentSelectModal';
import * as fcl from "@onflow/fcl";
import {set, update, use} from "use-minimal-state";
import {appState} from "~/state";
import {init} from "@onflow/fcl-wc";
import clsx from 'clsx';


const pluralize = (count: number, label: string) => (
  count === 1 ? (
    `${count} ${label}`
  ): (
    `${count} ${label}s`
  )
)

const getMarkerCounters = (markers?: editor.IMarkerData[]) => {
  let errors = 0;
  let warnings = 0;
  if (!markers?.length) {
    return {errors, warnings};
  }

  for (let marker of markers) {

    switch (marker.severity) {
      case MarkerSeverity.Warning:
      case MarkerSeverity.Info:
        warnings++;
        break;
      case MarkerSeverity.Error:
        errors++;
        break;
      default:
        break;
    }
  }

  return {errors, warnings};
};

const getStatusItem = ({loading, lastError}) => {
  if (loading) {
    return (
      <StatusBarItem icon="Build">
        <EllipsisText>
          Loading
        </EllipsisText>
      </StatusBarItem>
    );
  }

  if (lastError) {
    return (
      <StatusBarItem
        icon="NotExecuted"
        hideTextOnMobile
        disabled
      >
      Execution failed
      </StatusBarItem>
    )
  }
  return null;
}

const StatusBar: React.FC = () => {
  const [ runSelectorModalVisible, setRunSelectorModalVisible ] = useState(false);

  const settings = use(appState, "settings")
  const status = use(appState, "status")

  const {warnings, errors} = getMarkerCounters(status.markers);
  const bgColor = status.loading ? 'bg-[#cc6633]' : 'bg-[#007fd4]';
  const [client, setClient] = useState(null);
  const [lastNetwork, setLastNetwork] = useState("unknown");


/*
  const wcSetup = useCallback(async (appTitle: string, iconUrl: string) => {

    try {
      const DEFAULT_APP_METADATA = {
        name: appTitle,
        description: appTitle,
        url: window.location.origin,
        icons: [iconUrl]
      }

      const { FclWcServicePlugin, client } = await init({
        projectId: '243bb5390e622617f5ae08321eedd0e6', // required
        metadata: DEFAULT_APP_METADATA, // optional
        includeBaseWC: true, // optional, default: false
      })
      const network: string = RuntimeType.toString(settings.runtime)
      setLastNetwork(network)
      setClient(client)
      fcl.pluginRegistry.add(FclWcServicePlugin)

    } catch (e) {
      throw e
    }
  }, [settings])
*/
  useEffect(() => {
    if (!settings.runtime) return
    const network: string = RuntimeType.toString(settings.runtime)
    if (network === lastNetwork) return

    fcl.config(config.networkConfig[settings.runtime])
    //if (!client || settings.runtime != lastNetwork) {
    //  wcSetup("run.dnz.dev", "")
    //}
  }, [settings]);



  const getLanguageServerStatusItem = () => {
    const lsStatus = status.languageServerStatus;

    if (lsStatus === "initializing") {
      return (
        <StatusBarItem icon="Sync">
          <EllipsisText>Language Server Starting</EllipsisText>
        </StatusBarItem>
      );
    }

    if (lsStatus === "checking") {
      return (
        <StatusBarItem icon="Sync">
          <EllipsisText>Checking</EllipsisText>
        </StatusBarItem>
      );
    }

    if (lsStatus === "ready") {
      return (
        <StatusBarItem icon="Pass" title="Language Server Ready">
          Ready
        </StatusBarItem>
      );
    }

    return null;
  };

  return (
    <>
      <div className={clsx('flex flex-row text-white px-[7px] justify-between h-[22px]', bgColor)}>
        <div className="flex flex-row">
          <StatusBarItem
            icon="ErrorBadge"
            button
          >
            {pluralize(errors, 'Error')}
          </StatusBarItem>
          {warnings > 0 ? (
            <StatusBarItem
              icon="Warning"
              button
            >
              {pluralize(warnings, 'Warning')}
            </StatusBarItem>
          ) : null}
          {getStatusItem({loading:status.loading, lastError:status.lastError})}
          {getLanguageServerStatusItem()}
        </div>
        <div className="flex flex-row">
          <StatusBarItem
            icon="Code"
            title="Select environment"
            disabled={status.loading}
            onClick={() => setRunSelectorModalVisible(true)}
            hideTextOnMobile
            button
          >
            Environment: {RuntimeType.toString(settings.runtime)}
          </StatusBarItem>
          <StatusBarItem
            icon="Feedback"
            title="Send feedback"
            href={config.issueUrl}
            iconOnly
          />
          <StatusBarItem
            imageSrc="/github-mark-light-32px.png"
            title="GitHub"
            href={config.githubUrl}
            iconOnly
          />
        </div>
      </div>
      <EnvironmentSelectModal
        value={settings.runtime as RuntimeType}
        isOpen={runSelectorModalVisible}
        onClose={val => {
          setRunSelectorModalVisible(false);
          if (val) {
            appState.settings.runtime = val
            update(appState,"settings")

          }
        }}
      />
    </>
  );
};

export default StatusBar;
