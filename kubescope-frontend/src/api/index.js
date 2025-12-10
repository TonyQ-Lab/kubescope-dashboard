export async function getJSON(path) {
    const res = await fetch(path)
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export function getPods(namespace = 'default'){
    return getJSON(`/api/pods?namespace=${encodeURIComponent(namespace)}`)
}

export function getDeployments(namespace = 'default'){
    return getJSON(`/api/deployments?namespace=${encodeURIComponent(namespace)}`)
}

export function getReplicaSets(namespace = 'default'){
    return getJSON(`/api/replicasets?namespace=${encodeURIComponent(namespace)}`)
}

export function getStatefulSets(namespace = 'default'){
    return getJSON(`/api/statefulsets?namespace=${encodeURIComponent(namespace)}`)
}

export function getDaemonSets(namespace = 'default'){
    return getJSON(`/api/daemonsets?namespace=${encodeURIComponent(namespace)}`)
}

export function getNamespaces() {
    return getJSON('/api/namespaces')
}


export function getNodes(){
    return getJSON('/api/nodes')
}


export function getNodeMetrics(){
    return getJSON('/api/metrics/nodes')
}


export function getPodMetrics(ns = 'default'){
    return getJSON(`/api/metrics/pods?namespace=${encodeURIComponent(ns)}`)
}