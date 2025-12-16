// Supabase service for user snippet management
// This file is only imported dynamically on the client side

export interface UserSnippet {
  id: string;
  user_id: string;
  name: string;
  code: string;
  type: 'script' | 'transaction';
  network: 'mainnet' | 'testnet';
  folder_path: string; // e.g., "Mainnet/Scripts" or "Testnet/Transactions"
  created_at: string;
  updated_at: string;
}

export interface SnippetFolder {
  id: string;
  user_id: string;
  name: string;
  parent_path: string; // e.g., "Mainnet" or "Mainnet/Scripts"
  network: 'mainnet' | 'testnet';
  created_at: string;
}

export class SupabaseSnippetService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  // Get all user snippets
  async getUserSnippets(): Promise<UserSnippet[]> {
    const { data, error } = await this.supabase
      .from('user_snippets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get snippets by network
  async getSnippetsByNetwork(network: 'mainnet' | 'testnet'): Promise<UserSnippet[]> {
    const { data, error } = await this.supabase
      .from('user_snippets')
      .select('*')
      .eq('network', network)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create a new snippet
  async createSnippet(snippet: Omit<UserSnippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<UserSnippet> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('user_snippets')
      .insert({
        ...snippet,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a snippet
  async updateSnippet(id: string, updates: Partial<Omit<UserSnippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserSnippet> {
    const { data, error } = await this.supabase
      .from('user_snippets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a snippet
  async deleteSnippet(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_snippets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get user folders
  async getUserFolders(): Promise<SnippetFolder[]> {
    const { data, error } = await this.supabase
      .from('user_folders')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Create a new folder
  async createFolder(folder: Omit<SnippetFolder, 'id' | 'user_id' | 'created_at'>): Promise<SnippetFolder> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('user_folders')
      .insert({
        ...folder,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a folder
  async deleteFolder(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
