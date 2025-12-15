import React from 'react'
import { settingsSectionStyles } from './styles'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export default function SettingsSection(props: SettingsSectionProps) {
  return (
    <div className={settingsSectionStyles.section}>
      <div className={settingsSectionStyles.title}>{props.title}</div>
      {props.children}
    </div>
  )
}
