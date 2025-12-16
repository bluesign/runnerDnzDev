import React, { useEffect, useState } from 'react';
import { use, update } from 'use-minimal-state';
import { appState } from '~/state';
import { FiMenu, FiX, FiFolder, FiFile, FiPlus, FiLogOut, FiChevronRight, FiChevronDown } from 'react-icons/fi';

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  isExpanded?: boolean;
  network?: 'mainnet' | 'testnet';
  fileType?: 'script' | 'transaction';
  code?: string;
}

const defaultTree: TreeNode[] = [
  {
    id: 'mainnet',
    name: 'Mainnet',
    type: 'folder',
    isExpanded: false,
    children: [
      { id: 'mainnet-scripts', name: 'Scripts', type: 'folder', network: 'mainnet', children: [] },
      { id: 'mainnet-transactions', name: 'Transactions', type: 'folder', network: 'mainnet', children: [] },
    ]
  },
  {
    id: 'testnet',
    name: 'Testnet',
    type: 'folder',
    isExpanded: false,
    children: [
      { id: 'testnet-scripts', name: 'Scripts', type: 'folder', network: 'testnet', children: [] },
      { id: 'testnet-transactions', name: 'Transactions', type: 'folder', network: 'testnet', children: [] },
    ]
  }
];

const Sidebar: React.FC = () => {
  const UI = use(appState, "UI");
  const editor = use(appState, "editor");
  const [user, setUser] = useState<any>(null);
  const [tree, setTree] = useState<TreeNode[]>(defaultTree);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Placeholder for Supabase authentication
    // This will be implemented when Supabase is properly configured
    console.log('Login functionality requires Supabase configuration');
    alert('Supabase authentication needs to be configured.\n\nPlease add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
  };

  const handleLogout = async () => {
    setUser(null);
  };

  const toggleSidebar = () => {
    UI.sidebar.isOpen = !UI.sidebar.isOpen;
    update(appState, "UI");
  };

  const toggleNode = (nodeId: string, parentPath: TreeNode[] = tree): TreeNode[] => {
    return parentPath.map(node => {
      if (node.id === nodeId) {
        return { ...node, isExpanded: !node.isExpanded };
      }
      if (node.children) {
        return { ...node, children: toggleNode(nodeId, node.children) };
      }
      return node;
    });
  };

  const handleFileClick = (node: TreeNode) => {
    if (node.type === 'file' && node.code) {
      editor.code = node.code;
      editor.fileName = node.name;
      update(appState, "editor");
    }
  };

  const createNewFile = async (parentId: string, fileType: 'script' | 'transaction', network: 'mainnet' | 'testnet') => {
    const fileName = fileType === 'script' ? 'new_script.cdc' : 'new_transaction.cdc';
    const defaultCode = fileType === 'script' 
      ? '// New Script\npub fun main() {\n  // Your code here\n}\n'
      : '// New Transaction\ntransaction {\n  prepare(signer: AuthAccount) {\n    // Your code here\n  }\n  execute {\n  }\n}\n';

    // Set the editor with the new file
    editor.code = defaultCode;
    editor.fileName = fileName;
    update(appState, "editor");

    // If user is logged in, save to Supabase
    if (user) {
      // TODO: Implement Supabase save
      console.log('Save to Supabase:', { fileName, fileType, network });
    }
  };

  const renderTree = (nodes: TreeNode[], level: number = 0): React.ReactNode => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className="sidebar-tree-item"
          onClick={() => {
            if (node.type === 'folder') {
              const newTree = toggleNode(node.id);
              setTree(newTree);
            } else {
              handleFileClick(node);
            }
          }}
        >
          {node.type === 'folder' && (
            <span className="sidebar-tree-icon">
              {node.isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            </span>
          )}
          <span className="sidebar-tree-icon">
            {node.type === 'folder' ? <FiFolder size={16} /> : <FiFile size={16} />}
          </span>
          <span className="sidebar-tree-label">{node.name}</span>
          {node.type === 'folder' && node.network && (
            <div className="sidebar-tree-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="sidebar-tree-add-btn"
                onClick={() => createNewFile(node.id, 'script', node.network!)}
                title="Add Script"
              >
                <FiPlus size={14} />S
              </button>
              <button
                className="sidebar-tree-add-btn"
                onClick={() => createNewFile(node.id, 'transaction', node.network!)}
                title="Add Transaction"
              >
                <FiPlus size={14} />T
              </button>
            </div>
          )}
        </div>
        {node.type === 'folder' && node.isExpanded && node.children && (
          renderTree(node.children, level + 1)
        )}
      </div>
    ));
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
        <FiMenu size={20} />
      </button>
      
      <div className={`sidebar ${UI.sidebar.isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Snippets</h2>
          <button className="sidebar-close" onClick={toggleSidebar} aria-label="Close Sidebar">
            <FiX size={20} />
          </button>
        </div>

        <div className="sidebar-auth">
          {user ? (
            <div className="sidebar-user">
              <div className="sidebar-user-info">
                <span className="sidebar-user-email">{user.email}</span>
              </div>
              <button className="sidebar-logout-btn" onClick={handleLogout}>
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="sidebar-login">
              <p className="sidebar-login-message">Login to save and manage your snippets</p>
              <button className="sidebar-login-btn" onClick={handleLogin}>
                Login with GitHub
              </button>
            </div>
          )}
        </div>

        <div className="sidebar-tree">
          {renderTree(tree)}
        </div>
      </div>

      {UI.sidebar.isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
