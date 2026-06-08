// Central API base URL — prefers Angular environment, then runtime override, then default.
import { environment } from '../environments/environment';

export const API_BASE: string =
	environment?.apiBase || (window as any).__env?.API_BASE || 'http://localhost:8088';
