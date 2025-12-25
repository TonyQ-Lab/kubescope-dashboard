{{/*
Common labels
*/}}
{{- define "kubescope.labels" -}}
app.kubernetes.io/name: kubescope
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.Version }}
{{- end }}
