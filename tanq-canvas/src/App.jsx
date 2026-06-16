import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- 1. カスタムカード（ノード）の定義 ---

// 🟩 出典カード（右側にだけ接続口がある）
const SourceNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{
      background: '#e6f4ea', border: '2px solid #137333', borderRadius: '8px',
      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ background: '#137333', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          出典・文献
        </span>
        <button onClick={() => data.onDelete(id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5f6368', fontWeight: 'bold' }}>✕</button>
      </div>
      
      <select 
        value={data.type || 'Webサイト'} 
        onChange={(e) => data.onChange(id, 'type', e.target.value)}
        style={{ width: '100%', marginBottom: '6px', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0' }}
      >
        <option value="Webサイト">Webサイト</option>
        <option value="本・新聞">本・新聞</option>
        <option value="実験・アンケート">実験・アンケート</option>
        <option value="その他">その他</option>
      </select>

      <input 
        type="text" 
        placeholder="タイトル（例: 〇〇新聞の記事）" 
        value={data.title || ''} 
        onChange={(e) => data.onChange(id, 'title', e.target.value)}
        style={{ width: '95%', marginBottom: '6px', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0' }}
      />
      
      <input 
        type="text" 
        placeholder="URLや著者の名前" 
        value={data.detail || ''} 
        onChange={(e) => data.onChange(id, 'detail', e.target.value)}
        style={{ width: '95%', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0' }}
      />
      
      {/* 出典は右側（出力）にだけ接続口がある */}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} id="source-right" style={{ background: '#137333', width: '10px', height: '10px' }} />
    </div>
  );
};

// 🟦 根拠カード（左側に入力、右側に出力がある）
const EvidenceNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{
      background: '#e8f0fe', border: '2px solid #1a73e8', borderRadius: '8px',
      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* 左側の接続口（出典から繋がる） */}
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} id="evidence-left" style={{ background: '#1a73e8', width: '10px', height: '10px' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ background: '#1a73e8', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          根拠資料・引用
        </span>
        <button onClick={() => data.onDelete(id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5f6368', fontWeight: 'bold' }}>✕</button>
      </div>

      <textarea 
        placeholder="書いてあった「事実」だけを書こう！" 
        value={data.text || ''} 
        onChange={(e) => data.onChange(id, 'text', e.target.value)}
        rows={3}
        style={{ width: '95%', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0', resize: 'none', fontFamily: 'sans-serif' }}
      />

      <span style={{ fontSize: '10px', color: '#1a73e8', block: 'true', marginTop: '4px' }}>※自分の意見はここに入れません</span>

      {/* 右側の接続口（考えへ繋がる） */}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} id="evidence-right" style={{ background: '#1a73e8', width: '10px', height: '10px' }} />
    </div>
  );
};

// 🟥 自分の考えカード（左側にだけ接続口がある）
const ThoughtNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{
      background: '#fce8e6', border: '2px solid #d93025', borderRadius: '8px',
      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* 左側の接続口（根拠から繋がる） */}
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} id="thought-left" style={{ background: '#d93025', width: '10px', height: '10px' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ background: '#d93025', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          自分の考え
        </span>
        <button onClick={() => data.onDelete(id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5f6368', fontWeight: 'bold' }}>✕</button>
      </div>

      <select 
        value={data.type || '問い・疑問'} 
        onChange={(e) => data.onChange(id, 'type', e.target.value)}
        style={{ width: '100%', marginBottom: '6px', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0' }}
      >
        <option value="問い・疑問">問い・疑問</option>
        <option value="自分の予想">自分の予想</option>
        <option value="分析・考察">分析・考察</option>
        <option value="結論">結論</option>
      </select>

      <textarea 
        placeholder="〜だから、◯◯なのではないかと考えた。" 
        value={data.text || ''} 
        onChange={(e) => data.onChange(id, 'text', e.target.value)}
        rows={3}
        style={{ width: '95%', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0', resize: 'none', fontFamily: 'sans-serif' }}
      />
    </div>
  );
};

// React Flowにカスタムノードを登録
const nodeTypes = {
  sourceNode: SourceNode,
  evidenceNode: EvidenceNode,
  thoughtNode: ThoughtNode,
};


// --- 2. メインコンポーネント ---

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // カード内のテキスト変更をデータに反映する関数
  const handleNodeDataChange = useCallback((id, key, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, [key]: value };
        }
        return node;
      })
    );
  }, [setNodes]);

  // カードを削除する関数（パターンA: 連動する線も自動で消える）
  const handleNodeDelete = useCallback((id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges]);

  // 新しいカードを追加する共通処理
  const addNode = (type) => {
    const id = `${type}-${Date.now()}`;
    const newNode = {
      id,
      type,
      position: { x: 100 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: { 
        onChange: handleNodeDataChange, 
        onDelete: handleNodeDelete,
        title: '', detail: '', text: '', type: '' 
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // 🔗 パターン2: 接続制限ルールの適用
  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);

    // ルール1: 出典(sourceNode) ➔ 根拠(evidenceNode) のみ許可
    if (sourceNode?.type === 'sourceNode' && targetNode?.type === 'evidenceNode') {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#1a73e8', strokeWidth: 2 } }, eds));
      return;
    }
    // ルール2: 根拠(evidenceNode) ➔ 考え(thoughtNode) のみ許可
    if (sourceNode?.type === 'evidenceNode' && targetNode?.type === 'thoughtNode') {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#d93025', strokeWidth: 2 } }, eds));
      return;
    }

    // ルール外の接続（例: 出典から考えへ直通など）はアラートを出して拒否
    alert('【つなぎ方のルールエラー】\n「出典」➔「根拠」、または「根拠」➔「自分の考え」の順番でつなげよう！');
  }, [nodes, setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      {/* 上部ヘッダー（コントロールパネル） */}
      <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#202124' }}>探究ロジックキャンバス</h3>
        <button onClick={() => addNode('sourceNode')} style={{ background: '#137333', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ＋ 出典を追加
        </button>
        <button onClick={() => addNode('evidenceNode')} style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ＋ 根拠を追加
        </button>
        <button onClick={() => addNode('thoughtNode')} style={{ background: '#d93025', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ＋ 自分の考えを追加
        </button>
      </div>

      {/* メインのキャンバスエリア */}
      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}