export function countAge(object) {
    const now = new Date();
      const pastTimestamp = new Date(object.metadata.creationTimestamp);

      const timeDifference = now.getTime() - pastTimestamp.getTime();
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (years > 0) {
          return `${years}y`;
      } else if (months > 0) {
          return `${months}m`;
      } else if (weeks > 0) {
          return `${weeks}w`;
      } else if (days > 0) {
          return `${days}d`;
      } else if (hours > 0) {
          return `${hours}h`;
      } else if (minutes > 0) {
          return `${minutes}m`;
      } else {
          return `${seconds}s`;
      }
}

export function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return `${text.slice(0, maxLength)}...`;
}

export function getPortString(ports) {
    let result = [];
    for (const port of ports) {
        if (port.nodePort)
            result.push(`${port.port}:${port.nodePort}/${port.protocol}`);
        else result.push(`${port.port}/${port.protocol}`);
    }
    return result.join(", ");
}

export function getExternalIP(service) {
    if (service.spec.type !== "LoadBalancer")
        return "<none>";
    if (service.status.loadBalancer.ingress) {
        if (service.status.loadBalancer.ingress.ip)
            return `${service.status.loadBalancer.ingress.ip}`;
        else if (service.status.loadBalancer.ingress.hostname)
            return `${service.status.loadBalancer.ingress.hostname}`;
        else return "<pending>";
    }
    return "<pending>";
}