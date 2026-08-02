import { privateBackendUnavailable } from './_privateNotice';

export interface Server {
  name: string;
  episodeId: number;
  cmId: string;
  serverId: string;
  linkId: string;
}

export interface ServerType {
  type: string;
  label: string;
  servers: Server[];
}

export interface ServerResult {
  episode?: number;
  message: string;
  types: ServerType[];
}

/** Private provider logic omitted from public review repo. */
export const getServer = async (_servers = ''): Promise<ServerResult> => {
  privateBackendUnavailable();
};
